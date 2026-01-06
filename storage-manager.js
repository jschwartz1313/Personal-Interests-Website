/**
 * Multi-layer Storage Manager
 * Provides robust data persistence using:
 * 1. localStorage (primary)
 * 2. IndexedDB (secondary/backup)
 * 3. Auto-backup to downloadable files
 */

class MultiLayerStorage {
    constructor() {
        this.dbName = 'InterestsDB';
        this.dbVersion = 1;
        this.storeName = 'userData';
        this.db = null;
        this.autoBackupEnabled = true;
        this.lastBackupTime = null;

        this.initIndexedDB();
        this.loadAutoBackupSettings();
    }

    // ===== INDEXEDDB INITIALIZATION =====
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.warn('IndexedDB not available, using localStorage only');
                resolve(null);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB initialized successfully');
                this.syncFromIndexedDB();
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
        });
    }

    // ===== SAVE OPERATIONS =====
    async saveRating(cardId, rating) {
        const key = `rating-${cardId}`;
        const value = rating.toString();

        // Save to localStorage
        localStorage.setItem(key, value);

        // Save to IndexedDB
        await this.saveToIndexedDB(key, value);

        // Trigger auto-backup check
        this.checkAutoBackup();

        return true;
    }

    async saveNotes(cardId, notes) {
        const key = `notes-${cardId}`;

        // Save to localStorage
        localStorage.setItem(key, notes);

        // Save to IndexedDB
        await this.saveToIndexedDB(key, notes);

        // Trigger auto-backup check
        this.checkAutoBackup();

        return true;
    }

    async saveToIndexedDB(key, value) {
        if (!this.db) return false;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({
                key: key,
                value: value,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.warn('IndexedDB save failed, localStorage still active');
                resolve(false);
            };
        });
    }

    // ===== RETRIEVE OPERATIONS =====
    getRating(cardId) {
        return localStorage.getItem(`rating-${cardId}`);
    }

    getNotes(cardId) {
        return localStorage.getItem(`notes-${cardId}`) || '';
    }

    async getFromIndexedDB(key) {
        if (!this.db) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => resolve(null);
        });
    }

    // ===== SYNC OPERATIONS =====
    async syncFromIndexedDB() {
        if (!this.db) return;

        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const { key, value } = cursor.value;
                // Only restore if not in localStorage
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, value);
                    console.log(`Restored ${key} from IndexedDB`);
                }
                cursor.continue();
            }
        };
    }

    // ===== DATA EXPORT/IMPORT =====
    getAllData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            ratings: {},
            notes: {}
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            if (key.startsWith('rating-')) {
                const cardId = key.replace('rating-', '');
                data.ratings[cardId] = parseInt(value);
            } else if (key.startsWith('notes-')) {
                const cardId = key.replace('notes-', '');
                data.notes[cardId] = value;
            }
        }

        return data;
    }

    exportToFile(filename = null) {
        const data = this.getAllData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = filename || `my-interests-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);

        // Update last backup time
        this.lastBackupTime = Date.now();
        localStorage.setItem('lastBackupTime', this.lastBackupTime.toString());

        return true;
    }

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    await this.importData(data);
                    resolve(true);
                } catch (error) {
                    reject(new Error('Invalid backup file format'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async importData(data) {
        // Import ratings
        if (data.ratings) {
            for (const [cardId, rating] of Object.entries(data.ratings)) {
                await this.saveRating(cardId, rating);
            }
        }

        // Import notes
        if (data.notes) {
            for (const [cardId, notes] of Object.entries(data.notes)) {
                await this.saveNotes(cardId, notes);
            }
        }

        return true;
    }

    // ===== AUTO-BACKUP =====
    loadAutoBackupSettings() {
        const enabled = localStorage.getItem('autoBackupEnabled');
        this.autoBackupEnabled = enabled !== 'false'; // Default true

        const lastBackup = localStorage.getItem('lastBackupTime');
        this.lastBackupTime = lastBackup ? parseInt(lastBackup) : null;
    }

    setAutoBackup(enabled) {
        this.autoBackupEnabled = enabled;
        localStorage.setItem('autoBackupEnabled', enabled.toString());
    }

    checkAutoBackup() {
        if (!this.autoBackupEnabled) return;

        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        // Auto-backup once per week
        if (!this.lastBackupTime || (now - this.lastBackupTime) > oneWeek) {
            this.autoBackup();
        }
    }

    autoBackup() {
        const data = this.getAllData();
        const json = JSON.stringify(data, null, 2);

        // Store in a special auto-backup key
        localStorage.setItem('autoBackup', json);
        localStorage.setItem('autoBackupDate', new Date().toISOString());

        this.lastBackupTime = Date.now();
        localStorage.setItem('lastBackupTime', this.lastBackupTime.toString());

        console.log('Auto-backup completed');
    }

    getAutoBackup() {
        const backup = localStorage.getItem('autoBackup');
        const date = localStorage.getItem('autoBackupDate');

        if (backup && date) {
            return {
                data: JSON.parse(backup),
                date: date
            };
        }
        return null;
    }

    // ===== DATA STATISTICS =====
    getStats() {
        let ratingsCount = 0;
        let notesCount = 0;
        let totalRating = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            if (key.startsWith('rating-')) {
                ratingsCount++;
                totalRating += parseInt(value);
            } else if (key.startsWith('notes-') && value.length > 0) {
                notesCount++;
            }
        }

        return {
            ratingsCount,
            notesCount,
            averageRating: ratingsCount > 0 ? (totalRating / ratingsCount).toFixed(1) : 0,
            lastBackup: this.lastBackupTime ? new Date(this.lastBackupTime).toLocaleDateString() : 'Never',
            storageUsed: this.getStorageSize()
        };
    }

    getStorageSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += key.length + value.length;
        }
        return `${(total / 1024).toFixed(2)} KB`;
    }

    // ===== CLEAR DATA =====
    async clearAllData() {
        // Clear localStorage
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('rating-') || key.startsWith('notes-')) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));

        // Clear IndexedDB
        if (this.db) {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            await store.clear();
        }

        return true;
    }

    // ===== HEALTH CHECK =====
    async healthCheck() {
        const health = {
            localStorage: false,
            indexedDB: false,
            issues: []
        };

        // Test localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            health.localStorage = true;
        } catch (e) {
            health.issues.push('localStorage not available or full');
        }

        // Test IndexedDB
        if (this.db) {
            health.indexedDB = true;
        } else {
            health.issues.push('IndexedDB not available');
        }

        return health;
    }
}

// Create global instance
window.storageManager = new MultiLayerStorage();
