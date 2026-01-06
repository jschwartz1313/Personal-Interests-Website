// ========================================
// SEARCH FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    initializeKeyboardShortcuts();
    initializeMobileMenu();
    initializeCompletionTracker();
});

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        performSearch(query, searchResults);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.add('hidden');
        }
    });
}

function performSearch(query, resultsContainer) {
    const allCards = document.querySelectorAll('.expandable-card');
    const results = [];

    allCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const intro = card.querySelector('.card-intro')?.textContent.toLowerCase() || '';
        const details = card.querySelector('.card-details')?.textContent.toLowerCase() || '';
        const notes = card.querySelector('.notes-input')?.value.toLowerCase() || '';

        if (title.includes(query) || intro.includes(query) || details.includes(query) || notes.includes(query)) {
            const category = getCardCategory(card);
            results.push({
                title: card.querySelector('h3')?.textContent,
                intro: card.querySelector('.card-intro')?.textContent,
                category: category,
                element: card
            });
        }
    });

    displaySearchResults(results, resultsContainer, query);
}

function getCardCategory(card) {
    const section = card.closest('.content-section, .category-section');
    if (!section) return 'Unknown';

    const sectionTitle = section.querySelector('h2')?.textContent || 'Unknown';
    return sectionTitle;
}

function displaySearchResults(results, container, query) {
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No interests found matching "' + query + '"</div>';
        container.classList.remove('hidden');
        return;
    }

    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-category">${result.category}</div>
        `;

        item.addEventListener('click', () => {
            // Scroll to and expand the card
            result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            result.element.classList.add('expanded');

            // Highlight briefly
            result.element.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.5)';
            setTimeout(() => {
                result.element.style.boxShadow = '';
            }, 2000);

            container.classList.add('hidden');
            document.getElementById('search-input').value = '';
        });

        container.appendChild(item);
    });

    container.classList.remove('hidden');
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function initializeKeyboardShortcuts() {
    const shortcuts = {
        '/': () => focusSearch(),
        'Escape': () => clearSearch(),
        'h': () => window.location.href = 'index.html',
        's': () => window.location.href = 'stats.html',
        'g': () => window.location.href = 'gallery.html',
        't': () => window.location.href = 'timeline.html',
        'a': () => window.location.href = 'add.html'
    };

    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }

        // Ctrl/Cmd shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'k':
                    e.preventDefault();
                    focusSearch();
                    break;
                case 'e':
                    e.preventDefault();
                    exportData();
                    break;
            }
            return;
        }

        // Regular shortcuts
        if (shortcuts[e.key]) {
            e.preventDefault();
            shortcuts[e.key]();
        }
    });

    // Show shortcuts help
    createShortcutsHelp();
}

function focusSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
}

function createShortcutsHelp() {
    const helpButton = document.createElement('button');
    helpButton.className = 'shortcuts-help-btn';
    helpButton.innerHTML = '⌨️';
    helpButton.title = 'Keyboard Shortcuts';
    helpButton.onclick = showShortcutsModal;
    document.body.appendChild(helpButton);
}

function showShortcutsModal() {
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-modal-content">
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div class="shortcuts-grid">
                <div class="shortcut-item">
                    <kbd>/</kbd> or <kbd>Ctrl+K</kbd>
                    <span>Focus search</span>
                </div>
                <div class="shortcut-item">
                    <kbd>H</kbd>
                    <span>Go to Home</span>
                </div>
                <div class="shortcut-item">
                    <kbd>S</kbd>
                    <span>Go to Stats</span>
                </div>
                <div class="shortcut-item">
                    <kbd>G</kbd>
                    <span>Go to Gallery</span>
                </div>
                <div class="shortcut-item">
                    <kbd>T</kbd>
                    <span>Go to Timeline</span>
                </div>
                <div class="shortcut-item">
                    <kbd>A</kbd>
                    <span>Add Interest</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl+E</kbd>
                    <span>Export Data</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Clear search / Blur input</span>
                </div>
            </div>
            <button class="close-modal-btn" onclick="this.closest('.shortcuts-modal').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ========================================
// MOBILE MENU
// ========================================

function initializeMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Toggle menu');

    nav.insertBefore(hamburger, nav.firstChild);

    hamburger.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('mobile-active');
        hamburger.classList.toggle('active');
        hamburger.innerHTML = hamburger.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.remove('mobile-active');
            hamburger.classList.remove('active');
            hamburger.innerHTML = '☰';
        });
    });
}

// ========================================
// COMPLETION TRACKER
// ========================================

function initializeCompletionTracker() {
    const cards = document.querySelectorAll('.expandable-card');

    cards.forEach(card => {
        updateCardCompletion(card);

        // Watch for changes in checkboxes
        const checkboxes = card.querySelectorAll('.watched-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateCardCompletion(card);
            });
        });
    });
}

function updateCardCompletion(card) {
    const mediaItems = card.querySelectorAll('.media-item');
    if (mediaItems.length === 0) return;

    const completed = Array.from(mediaItems).filter(item => {
        return item.querySelector('.watched-checkbox')?.checked;
    }).length;

    const total = mediaItems.length;
    const percentage = Math.round((completed / total) * 100);

    // Add or update completion badge
    let badge = card.querySelector('.completion-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'completion-badge';
        card.appendChild(badge);
    }

    badge.textContent = `${completed}/${total} (${percentage}%)`;
    badge.style.background = getCompletionColor(percentage);
}

function getCompletionColor(percentage) {
    if (percentage === 100) return 'linear-gradient(135deg, #27ae60, #2ecc71)';
    if (percentage >= 75) return 'linear-gradient(135deg, #3498db, #2980b9)';
    if (percentage >= 50) return 'linear-gradient(135deg, #f39c12, #e67e22)';
    if (percentage >= 25) return 'linear-gradient(135deg, #e74c3c, #c0392b)';
    return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
}

// ========================================
// ENHANCED EXPORT
// ========================================

function exportData() {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
        <div class="export-modal-content">
            <h2>📥 Export Your Data</h2>
            <p>Choose your export format:</p>
            <div class="export-buttons">
                <button onclick="exportAsJSON()" class="export-btn">
                    📄 JSON<br>
                    <small>Complete data backup</small>
                </button>
                <button onclick="exportAsCSV()" class="export-btn">
                    📊 CSV<br>
                    <small>Spreadsheet format</small>
                </button>
                <button onclick="exportAsMarkdown()" class="export-btn">
                    📝 Markdown<br>
                    <small>Readable text format</small>
                </button>
            </div>
            <button class="close-modal-btn" onclick="this.closest('.export-modal').remove()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function exportAsJSON() {
    const data = getAllData();
    downloadFile(JSON.stringify(data, null, 2), 'my-interests.json', 'application/json');
    document.querySelector('.export-modal')?.remove();
}

function exportAsCSV() {
    const data = getAllData();
    let csv = 'Interest,Category,Rating,Notes,Created\n';

    data.interests.forEach(interest => {
        const rating = data.ratings[interest.id] || '';
        const notes = (data.notes[interest.id] || '').replace(/"/g, '""');
        csv += `"${interest.title}","${interest.category}","${rating}","${notes}","${interest.created || ''}"\n`;
    });

    downloadFile(csv, 'my-interests.csv', 'text/csv');
    document.querySelector('.export-modal')?.remove();
}

function exportAsMarkdown() {
    const data = getAllData();
    let md = '# My Interests\n\n';

    const categories = {};
    data.interests.forEach(interest => {
        if (!categories[interest.category]) categories[interest.category] = [];
        categories[interest.category].push(interest);
    });

    Object.entries(categories).forEach(([category, interests]) => {
        md += `## ${category}\n\n`;
        interests.forEach(interest => {
            const rating = data.ratings[interest.id] ? '⭐'.repeat(data.ratings[interest.id]) : 'Not rated';
            md += `### ${interest.title}\n\n`;
            md += `**Rating:** ${rating}\n\n`;
            if (data.notes[interest.id]) {
                md += `**Notes:** ${data.notes[interest.id]}\n\n`;
            }
            md += '---\n\n';
        });
    });

    downloadFile(md, 'my-interests.md', 'text/markdown');
    document.querySelector('.export-modal')?.remove();
}

function getAllData() {
    const data = {
        interests: [],
        ratings: {},
        notes: {},
        exported: new Date().toISOString()
    };

    // Get all cards
    document.querySelectorAll('.expandable-card').forEach(card => {
        const id = card.dataset.cardId;
        const title = card.querySelector('h3')?.textContent;
        const category = getCardCategory(card);

        if (id && title) {
            data.interests.push({ id, title, category });
        }
    });

    // Get ratings and notes from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (key.startsWith('rating-')) {
            data.ratings[key.replace('rating-', '')] = value;
        } else if (key.startsWith('notes-')) {
            data.notes[key.replace('notes-', '')] = value;
        }
    }

    return data;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showNotification(`Exported as ${filename}!`);
}
