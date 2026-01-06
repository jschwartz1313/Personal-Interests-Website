// Wait for storage manager to load
let StorageManager;

// Initialize StorageManager after DOM loads
function initStorageManager() {
    // Use the global storageManager instance
    StorageManager = window.storageManager || {
        // Fallback to simple localStorage if storage-manager.js fails to load
        saveRating(cardId, rating) {
            localStorage.setItem(`rating-${cardId}`, rating);
            return Promise.resolve(true);
        },
        getRating(cardId) {
            return localStorage.getItem(`rating-${cardId}`);
        },
        saveNotes(cardId, notes) {
            localStorage.setItem(`notes-${cardId}`, notes);
            return Promise.resolve(true);
        },
        getNotes(cardId) {
            return localStorage.getItem(`notes-${cardId}`) || '';
        },
        getAllData() {
            return { ratings: {}, notes: {} };
        },
        exportToFile() {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-interests-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
}

// Star Rating System
class StarRating {
    constructor(cardElement) {
        this.card = cardElement;
        this.cardId = cardElement.dataset.cardId;
        this.stars = cardElement.querySelectorAll('.star');
        this.ratingText = cardElement.querySelector('.rating-text');
        this.currentRating = 0;

        this.init();
    }

    init() {
        // Check if required elements exist
        if (!this.stars || this.stars.length === 0 || !this.ratingText) {
            console.warn('StarRating: Missing required elements for card', this.cardId);
            return;
        }

        // Load saved rating
        const savedRating = StorageManager.getRating(this.cardId);
        if (savedRating) {
            this.setRating(parseInt(savedRating), false);
        }

        // Add event listeners
        this.stars.forEach(star => {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = parseInt(star.dataset.value);
                this.setRating(value, true);
            });

            star.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const value = parseInt(star.dataset.value);
                this.highlightStars(value);
            });
        });

        const ratingContainer = this.card.querySelector('.card-rating');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating);
            });
        }
    }

    setRating(value, save = true) {
        this.currentRating = value;
        this.highlightStars(value);

        if (save) {
            StorageManager.saveRating(this.cardId, value);
            this.showFeedback();
        }

        this.updateRatingText(value);
    }

    highlightStars(value) {
        this.stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    updateRatingText(value) {
        const texts = {
            0: 'Rate this interest',
            1: 'Not for me',
            2: 'It\'s okay',
            3: 'I like it',
            4: 'Love it!',
            5: 'Absolutely amazing!'
        };
        this.ratingText.textContent = texts[value];
    }

    showFeedback() {
        this.ratingText.style.color = '#e74c3c';
        this.ratingText.style.fontWeight = 'bold';

        setTimeout(() => {
            this.ratingText.style.color = '';
            this.ratingText.style.fontWeight = '';
        }, 1000);
    }
}

// Personal Notes System
class PersonalNotes {
    constructor(cardElement) {
        this.card = cardElement;
        this.cardId = cardElement.dataset.cardId;
        this.textarea = cardElement.querySelector('.notes-input');
        this.saveBtn = cardElement.querySelector('.save-notes-btn');

        this.init();
    }

    init() {
        // Load saved notes
        const savedNotes = StorageManager.getNotes(this.cardId);
        if (savedNotes) {
            this.textarea.value = savedNotes;
            this.updateSaveButton(true);
        }

        // Add event listeners
        this.saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveNotes();
        });

        this.textarea.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        this.textarea.addEventListener('input', () => {
            this.updateSaveButton(false);
        });

        // Auto-save on blur
        this.textarea.addEventListener('blur', () => {
            if (this.textarea.value !== StorageManager.getNotes(this.cardId)) {
                this.saveNotes();
            }
        });
    }

    saveNotes() {
        const notes = this.textarea.value;
        StorageManager.saveNotes(this.cardId, notes);
        this.showSaveConfirmation();
        this.updateSaveButton(true);
    }

    updateSaveButton(saved) {
        if (saved) {
            this.saveBtn.textContent = '✓ Saved';
            this.saveBtn.classList.add('saved');
        } else {
            this.saveBtn.textContent = 'Save Notes';
            this.saveBtn.classList.remove('saved');
        }
    }

    showSaveConfirmation() {
        this.saveBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.saveBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

// Card Animation and Interaction
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage manager first
    initStorageManager();

    // Show storage status after a delay to allow IndexedDB to initialize
    // setTimeout(() => showStorageStatus(), 1000);

    // Animate cards on load
    const cards = document.querySelectorAll('.card');
    const navLinks = document.querySelectorAll('.nav-links a');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Smooth scrolling for navigation (only for anchor links on same page)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Only prevent default and smooth scroll for anchor links (starting with #)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const headerOffset = 80;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            // For regular page links (stats.html, etc.), let the browser handle it normally
        });
    });

    // Intersection Observer for headings
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.content-section h2, .category-header h2').forEach(heading => {
        observer.observe(heading);
    });

    // Expandable cards functionality
    const expandableCards = document.querySelectorAll('.expandable-card');
    console.log('Found expandable cards:', expandableCards.length);

    expandableCards.forEach((card, index) => {
        console.log(`Setting up card ${index}:`, card.querySelector('h3')?.textContent);

        // Add click handler to card
        card.addEventListener('click', function(e) {
            // Don't toggle if clicking on interactive elements
            if (e.target.tagName === 'A' ||
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('.star') ||
                e.target.closest('.notes-input') ||
                e.target.closest('.save-notes-btn') ||
                e.target.closest('.external-link') ||
                e.target.closest('.watched-checkbox') ||
                e.target.closest('.media-item a')) {
                return;
            }

            console.log('Toggling card:', this.querySelector('h3')?.textContent);
            this.classList.toggle('expanded');
        }, false);

        // Initialize rating system if card has ID and rating elements
        if (card.dataset.cardId) {
            // Only init StarRating if the card has rating elements
            if (card.querySelector('.card-rating')) {
                new StarRating(card);
            }
            // Only init PersonalNotes if the card has notes elements
            if (card.querySelector('.personal-notes')) {
                new PersonalNotes(card);
            }
        }
    });

    // Add export data button
    createExportButton();

    // Add stats display
    createStatsDisplay();

    // Add quick filter buttons
    createFilterButtons();

    // Add data management panel
    createDataManagementPanel();
});

// Create Export Data Button
function createExportButton() {
    const footer = document.querySelector('footer');
    const exportBtn = document.createElement('button');
    exportBtn.className = 'export-btn';
    exportBtn.innerHTML = '📥 Export My Data';
    exportBtn.addEventListener('click', () => {
        if (StorageManager.exportToFile) {
            StorageManager.exportToFile();
        } else {
            StorageManager.exportData();
        }
        showNotification('Data exported successfully!');
    });
    footer.insertBefore(exportBtn, footer.firstChild);
}

// Create Stats Display
function createStatsDisplay() {
    const hero = document.querySelector('#hero .hero-content');
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-display';

    updateStats(statsDiv);
    hero.appendChild(statsDiv);

    // Update stats periodically
    setInterval(() => updateStats(statsDiv), 5000);
}

function updateStats(statsDiv) {
    const allCards = document.querySelectorAll('[data-card-id]');
    let ratedCount = 0;
    let notesCount = 0;

    allCards.forEach(card => {
        const cardId = card.dataset.cardId;
        if (StorageManager.getRating(cardId)) ratedCount++;
        if (StorageManager.getNotes(cardId)) notesCount++;
    });

    statsDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${ratedCount}</span>
            <span class="stat-label">Rated</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${notesCount}</span>
            <span class="stat-label">Notes</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${allCards.length}</span>
            <span class="stat-label">Total</span>
        </div>
    `;
}

// Create Filter Buttons
function createFilterButtons() {
    const hero = document.querySelector('#hero');
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filter-buttons';
    filterDiv.innerHTML = `
        <button class="filter-btn active" data-filter="all">Show All</button>
        <button class="filter-btn" data-filter="rated">Rated Only</button>
        <button class="filter-btn" data-filter="unrated">Unrated</button>
        <button class="filter-btn" data-filter="with-notes">With Notes</button>
    `;

    hero.appendChild(filterDiv);

    // Add filter functionality
    filterDiv.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterDiv.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            const filter = btn.dataset.filter;
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    const allCards = document.querySelectorAll('[data-card-id]');

    allCards.forEach(card => {
        const cardId = card.dataset.cardId;
        let show = true;

        switch(filter) {
            case 'rated':
                show = !!StorageManager.getRating(cardId);
                break;
            case 'unrated':
                show = !StorageManager.getRating(cardId);
                break;
            case 'with-notes':
                show = !!StorageManager.getNotes(cardId);
                break;
            case 'all':
            default:
                show = true;
        }

        if (show) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E to export data
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (StorageManager.exportToFile) {
            StorageManager.exportToFile();
        } else {
            StorageManager.exportData();
        }
        showNotification('Data exported!');
    }
    // Ctrl/Cmd + D to open data management
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDataManagementPanel();
    }
});

// Show storage status indicator
function showStorageStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'storage-status';
    statusDiv.className = 'storage-status';
    statusDiv.innerHTML = '💾 Data saved locally';
    statusDiv.title = 'Your data is saved in your browser';
    document.body.appendChild(statusDiv);

    // Check health if available
    if (StorageManager.healthCheck) {
        StorageManager.healthCheck().then(health => {
            if (health.issues && health.issues.length > 0) {
                statusDiv.innerHTML = '⚠️ Storage warning';
                statusDiv.className = 'storage-status warning';
                statusDiv.title = health.issues.join(', ');
            }
        });
    }
}

// Create Data Management Panel
function createDataManagementPanel() {
    const panel = document.createElement('div');
    panel.id = 'data-management-panel';
    panel.className = 'data-panel hidden';
    panel.innerHTML = `
        <div class="data-panel-content">
            <div class="data-panel-header">
                <h2>📊 Data Management</h2>
                <button class="close-panel-btn" onclick="toggleDataManagementPanel()">✕</button>
            </div>

            <div class="data-panel-body">
                <div class="data-section">
                    <h3>📈 Statistics</h3>
                    <div id="data-stats" class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">-</div>
                            <div class="stat-label">Ratings</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">-</div>
                            <div class="stat-label">Notes</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">-</div>
                            <div class="stat-label">Avg Rating</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">-</div>
                            <div class="stat-label">Storage Used</div>
                        </div>
                    </div>
                </div>

                <div class="data-section">
                    <h3>💾 Backup & Restore</h3>
                    <div class="button-group">
                        <button class="panel-btn primary" onclick="exportBackup()">
                            📥 Download Backup
                        </button>
                        <button class="panel-btn" onclick="document.getElementById('import-file').click()">
                            📤 Restore from Backup
                        </button>
                        <input type="file" id="import-file" accept=".json" style="display: none" onchange="importBackup(this)">
                    </div>
                    <p class="help-text">
                        💡 Download your data regularly to keep a backup. Restore anytime from a backup file.
                    </p>
                </div>

                <div class="data-section">
                    <h3>⚙️ Settings</h3>
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto-backup-toggle" onchange="toggleAutoBackup(this)">
                        <span>Enable weekly auto-backup</span>
                    </label>
                    <div id="last-backup-info" class="info-text"></div>
                </div>

                <div class="data-section">
                    <h3>🔍 Storage Health</h3>
                    <div id="health-status" class="health-status">
                        <div class="health-item">
                            <span>localStorage:</span>
                            <span class="health-indicator" id="health-local">Checking...</span>
                        </div>
                        <div class="health-item">
                            <span>IndexedDB:</span>
                            <span class="health-indicator" id="health-indexed">Checking...</span>
                        </div>
                    </div>
                </div>

                <div class="data-section danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    <button class="panel-btn danger" onclick="confirmClearData()">
                        🗑️ Clear All Data
                    </button>
                    <p class="help-text">
                        This will permanently delete all your ratings and notes. Make a backup first!
                    </p>
                </div>
            </div>
        </div>
        <div class="data-panel-overlay" onclick="toggleDataManagementPanel()"></div>
    `;
    document.body.appendChild(panel);

    // Add floating button to open panel
    const floatingBtn = document.createElement('button');
    floatingBtn.className = 'floating-data-btn';
    floatingBtn.innerHTML = '⚙️';
    floatingBtn.title = 'Data Management (Ctrl/Cmd + D)';
    floatingBtn.onclick = toggleDataManagementPanel;
    document.body.appendChild(floatingBtn);

    // Initialize panel
    updateDataStats();
    checkHealth();
    updateAutoBackupToggle();
}

function toggleDataManagementPanel() {
    const panel = document.getElementById('data-management-panel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            updateDataStats();
            checkHealth();
        }
    }
}

function updateDataStats() {
    if (!StorageManager.getStats) return;

    const stats = StorageManager.getStats();
    const statsDiv = document.getElementById('data-stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${stats.ratingsCount}</div>
                <div class="stat-label">Ratings</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.notesCount}</div>
                <div class="stat-label">Notes</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.averageRating}</div>
                <div class="stat-label">Avg Rating</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.storageUsed}</div>
                <div class="stat-label">Storage Used</div>
            </div>
        `;
    }

    // Update last backup info
    const backupInfo = document.getElementById('last-backup-info');
    if (backupInfo) {
        backupInfo.textContent = `Last backup: ${stats.lastBackup}`;
    }
}

async function checkHealth() {
    if (!StorageManager.healthCheck) return;

    const health = await StorageManager.healthCheck();

    const localStatus = document.getElementById('health-local');
    const indexedStatus = document.getElementById('health-indexed');

    if (localStatus) {
        localStatus.textContent = health.localStorage ? '✅ Working' : '❌ Error';
        localStatus.className = 'health-indicator ' + (health.localStorage ? 'healthy' : 'error');
    }

    if (indexedStatus) {
        indexedStatus.textContent = health.indexedDB ? '✅ Working' : '⚠️ Not available';
        indexedStatus.className = 'health-indicator ' + (health.indexedDB ? 'healthy' : 'warning');
    }
}

function updateAutoBackupToggle() {
    const toggle = document.getElementById('auto-backup-toggle');
    if (toggle && StorageManager.autoBackupEnabled !== undefined) {
        toggle.checked = StorageManager.autoBackupEnabled;
    }
}

function toggleAutoBackup(checkbox) {
    if (StorageManager.setAutoBackup) {
        StorageManager.setAutoBackup(checkbox.checked);
        showNotification(checkbox.checked ? 'Auto-backup enabled' : 'Auto-backup disabled');
    }
}

function exportBackup() {
    if (StorageManager.exportToFile) {
        StorageManager.exportToFile();
        showNotification('Backup downloaded successfully!');
        updateDataStats();
    }
}

async function importBackup(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        if (StorageManager.importFromFile) {
            await StorageManager.importFromFile(file);
            showNotification('Backup restored successfully!');
            // Reload page to show imported data
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        showNotification('Failed to restore backup: ' + error.message);
    }
}

function confirmClearData() {
    const confirmed = confirm(
        '⚠️ WARNING: This will permanently delete ALL your ratings and notes!\n\n' +
        'Are you sure you want to continue?\n\n' +
        'Consider downloading a backup first.'
    );

    if (confirmed) {
        const doubleConfirm = confirm('Are you REALLY sure? This cannot be undone!');
        if (doubleConfirm) {
            clearAllData();
        }
    }
}

async function clearAllData() {
    if (StorageManager.clearAllData) {
        await StorageManager.clearAllData();
    } else {
        // Fallback clear
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('rating-') || key.startsWith('notes-')) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
    }

    showNotification('All data cleared!');
    setTimeout(() => location.reload(), 1000);
}

// ===== MEDIA ITEM TRACKING =====

// Initialize media item tracking
function initMediaTracking() {
    const mediaItems = document.querySelectorAll('.media-item');

    mediaItems.forEach(item => {
        const itemId = item.dataset.itemId;
        if (!itemId) return;

        const checkbox = item.querySelector('.watched-checkbox');
        const ratingSpan = item.querySelector('.item-rating');

        // Load saved state
        const isWatched = localStorage.getItem(`watched-${itemId}`) === 'true';
        const rating = parseInt(localStorage.getItem(`item-rating-${itemId}`)) || 0;

        // Set initial states
        if (isWatched) {
            checkbox.checked = true;
            item.classList.add('watched');
        }

        // Create mini stars for rating
        createMiniStars(ratingSpan, itemId, rating);

        // Add checkbox event listener
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const checked = checkbox.checked;
            localStorage.setItem(`watched-${itemId}`, checked);

            if (checked) {
                item.classList.add('watched');
            } else {
                item.classList.remove('watched');
            }
        });
    });
}

// Create mini star rating system for media items
function createMiniStars(container, itemId, currentRating = 0) {
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'mini-star';
        star.textContent = '★';
        star.dataset.value = i;

        if (i <= currentRating) {
            star.classList.add('filled');
        }

        star.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            setItemRating(itemId, i, container);
        });

        star.addEventListener('mouseenter', () => {
            highlightMiniStars(container, i);
        });

        container.appendChild(star);
    }

    container.addEventListener('mouseleave', () => {
        const savedRating = parseInt(localStorage.getItem(`item-rating-${itemId}`)) || 0;
        highlightMiniStars(container, savedRating);
    });
}

function setItemRating(itemId, rating, container) {
    localStorage.setItem(`item-rating-${itemId}`, rating);
    highlightMiniStars(container, rating);
}

function highlightMiniStars(container, rating) {
    const stars = container.querySelectorAll('.mini-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Initialize media tracking on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initMediaTracking();
    }, 500);
});
