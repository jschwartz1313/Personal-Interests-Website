// ========================================
// ADVANCED FILTERING & SORTING SYSTEM
// ========================================

class FilterSortManager {
    constructor() {
        this.currentFilters = {
            priority: 'all',
            tags: [],
            rating: 'all',
            category: 'all'
        };

        this.currentSort = 'default';

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFilterControls();
            this.setupEventListeners();
        });
    }

    setupFilterControls() {
        // Add filter bar to the page
        const hero = document.getElementById('hero');
        if (!hero) return;

        const filterBar = document.createElement('div');
        filterBar.className = 'filter-sort-bar';
        filterBar.innerHTML = `
            <div class="filter-sort-container">
                <div class="filter-section">
                    <h3>🔍 Filter & Sort</h3>
                    <button class="toggle-filters-btn" id="toggle-filters">
                        Show Filters ▼
                    </button>
                </div>

                <div class="filters-panel hidden" id="filters-panel">
                    <div class="filter-group">
                        <label>Priority:</label>
                        <select id="filter-priority">
                            <option value="all">All Priorities</option>
                            <option value="high">🔥 High Priority</option>
                            <option value="medium">⭐ Medium Priority</option>
                            <option value="low">💤 Low Priority</option>
                            <option value="none">No Priority</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Rating:</label>
                        <select id="filter-rating">
                            <option value="all">All Ratings</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                            <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                            <option value="3">⭐⭐⭐ 3+ Stars</option>
                            <option value="unrated">Not Rated</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Category:</label>
                        <select id="filter-category">
                            <option value="all">All Categories</option>
                            <option value="fandoms">Fandoms</option>
                            <option value="movies-tv">Movies & TV</option>
                            <option value="crafts">Crafts & Hobbies</option>
                            <option value="sports">Sports & Fitness</option>
                            <option value="podcasts">Podcasts</option>
                            <option value="technology">Technology</option>
                            <option value="ai">AI & Innovation</option>
                            <option value="energy">Energy Systems</option>
                        </select>
                    </div>

                    <div class="filter-group filter-group-tags">
                        <label>Tags:</label>
                        <div class="tag-filter-buttons">
                            <button class="tag-filter-btn" data-tag="Weekend Activity">Weekend Activity</button>
                            <button class="tag-filter-btn" data-tag="Solo">Solo</button>
                            <button class="tag-filter-btn" data-tag="Social">Social</button>
                            <button class="tag-filter-btn" data-tag="Indoor">Indoor</button>
                            <button class="tag-filter-btn" data-tag="Outdoor">Outdoor</button>
                            <button class="tag-filter-btn" data-tag="Free">Free</button>
                            <button class="tag-filter-btn" data-tag="Expensive">Expensive</button>
                            <button class="tag-filter-btn" data-tag="Creative">Creative</button>
                            <button class="tag-filter-btn" data-tag="Physical">Physical</button>
                            <button class="tag-filter-btn" data-tag="Learning">Learning</button>
                            <button class="tag-filter-btn" data-tag="Relaxing">Relaxing</button>
                            <button class="tag-filter-btn" data-tag="Challenging">Challenging</button>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>Sort by:</label>
                        <select id="sort-by">
                            <option value="default">Default Order</option>
                            <option value="rating-high">Rating (High to Low)</option>
                            <option value="rating-low">Rating (Low to High)</option>
                            <option value="priority">Priority (High to Low)</option>
                            <option value="alphabetical">Alphabetical (A-Z)</option>
                            <option value="alphabetical-reverse">Alphabetical (Z-A)</option>
                        </select>
                    </div>

                    <div class="filter-actions">
                        <button class="apply-filters-btn" id="apply-filters">Apply Filters</button>
                        <button class="reset-filters-btn" id="reset-filters">Reset All</button>
                    </div>

                    <div class="filter-results-count" id="filter-results-count"></div>
                </div>
            </div>
        `;

        hero.appendChild(filterBar);
    }

    setupEventListeners() {
        // Toggle filters panel
        const toggleBtn = document.getElementById('toggle-filters');
        const filtersPanel = document.getElementById('filters-panel');

        if (toggleBtn && filtersPanel) {
            toggleBtn.addEventListener('click', () => {
                filtersPanel.classList.toggle('hidden');
                toggleBtn.textContent = filtersPanel.classList.contains('hidden')
                    ? 'Show Filters ▼'
                    : 'Hide Filters ▲';
            });
        }

        // Tag filter buttons
        const tagFilterBtns = document.querySelectorAll('.tag-filter-btn');
        tagFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const tag = btn.dataset.tag;
                if (this.currentFilters.tags.includes(tag)) {
                    this.currentFilters.tags = this.currentFilters.tags.filter(t => t !== tag);
                } else {
                    this.currentFilters.tags.push(tag);
                }
            });
        });

        // Apply filters button
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFiltersAndSort();
            });
        }

        // Reset filters button
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Auto-apply on dropdown change
        const filterSelects = document.querySelectorAll('#filter-priority, #filter-rating, #filter-category, #sort-by');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.applyFiltersAndSort();
            });
        });
    }

    applyFiltersAndSort() {
        // Get current filter values
        this.currentFilters.priority = document.getElementById('filter-priority')?.value || 'all';
        this.currentFilters.rating = document.getElementById('filter-rating')?.value || 'all';
        this.currentFilters.category = document.getElementById('filter-category')?.value || 'all';
        this.currentSort = document.getElementById('sort-by')?.value || 'default';

        // Get all cards
        const allCards = Array.from(document.querySelectorAll('.card, .expandable-card'));
        let visibleCount = 0;

        // Filter cards
        allCards.forEach(card => {
            if (!card.dataset.cardId) {
                return; // Skip cards without IDs
            }

            let shouldShow = true;

            // Priority filter
            if (this.currentFilters.priority !== 'all') {
                const cardPriority = window.priorityTagsManager?.getCardPriority(card) || 'none';
                if (cardPriority !== this.currentFilters.priority) {
                    shouldShow = false;
                }
            }

            // Rating filter
            if (this.currentFilters.rating !== 'all') {
                const rating = parseInt(localStorage.getItem(`rating_${card.dataset.cardId}`)) || 0;
                if (this.currentFilters.rating === 'unrated' && rating > 0) {
                    shouldShow = false;
                } else if (this.currentFilters.rating !== 'unrated' && rating < parseInt(this.currentFilters.rating)) {
                    shouldShow = false;
                }
            }

            // Category filter
            if (this.currentFilters.category !== 'all') {
                const section = card.closest('.content-section');
                if (!section || section.id !== this.currentFilters.category) {
                    shouldShow = false;
                }
            }

            // Tags filter (card must have ALL selected tags)
            if (this.currentFilters.tags.length > 0) {
                const cardTags = window.priorityTagsManager?.getCardTags(card) || [];
                const hasAllTags = this.currentFilters.tags.every(tag => cardTags.includes(tag));
                if (!hasAllTags) {
                    shouldShow = false;
                }
            }

            // Show/hide card
            if (shouldShow) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Sort visible cards
        this.sortCards(allCards.filter(card => card.style.display !== 'none'));

        // Update results count
        this.updateResultsCount(visibleCount);
    }

    sortCards(cards) {
        if (this.currentSort === 'default') return;

        // Get parent containers
        const containers = new Map();
        cards.forEach(card => {
            const parent = card.parentElement;
            if (!containers.has(parent)) {
                containers.set(parent, []);
            }
            containers.get(parent).push(card);
        });

        // Sort cards within each container
        containers.forEach((cardList, parent) => {
            cardList.sort((a, b) => {
                switch (this.currentSort) {
                    case 'rating-high':
                        return this.getCardRating(b) - this.getCardRating(a);
                    case 'rating-low':
                        return this.getCardRating(a) - this.getCardRating(b);
                    case 'priority':
                        return this.getPriorityValue(b) - this.getPriorityValue(a);
                    case 'alphabetical':
                        return this.getCardTitle(a).localeCompare(this.getCardTitle(b));
                    case 'alphabetical-reverse':
                        return this.getCardTitle(b).localeCompare(this.getCardTitle(a));
                    default:
                        return 0;
                }
            });

            // Re-append in sorted order
            cardList.forEach(card => parent.appendChild(card));
        });
    }

    getCardRating(card) {
        if (!card.dataset.cardId) return 0;
        return parseInt(localStorage.getItem(`rating_${card.dataset.cardId}`)) || 0;
    }

    getPriorityValue(card) {
        const priority = window.priorityTagsManager?.getCardPriority(card) || 'none';
        const values = { high: 3, medium: 2, low: 1, none: 0 };
        return values[priority] || 0;
    }

    getCardTitle(card) {
        return card.querySelector('h3')?.textContent || '';
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('filter-results-count');
        if (resultsCount) {
            const total = document.querySelectorAll('.card[data-card-id], .expandable-card[data-card-id]').length;
            resultsCount.textContent = `Showing ${count} of ${total} interests`;
        }
    }

    resetFilters() {
        // Reset filter values
        this.currentFilters = {
            priority: 'all',
            tags: [],
            rating: 'all',
            category: 'all'
        };
        this.currentSort = 'default';

        // Reset UI
        document.getElementById('filter-priority').value = 'all';
        document.getElementById('filter-rating').value = 'all';
        document.getElementById('filter-category').value = 'all';
        document.getElementById('sort-by').value = 'default';

        document.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show all cards
        const allCards = document.querySelectorAll('.card, .expandable-card');
        allCards.forEach(card => {
            card.style.display = '';
        });

        // Update count
        const total = document.querySelectorAll('.card[data-card-id], .expandable-card[data-card-id]').length;
        this.updateResultsCount(total);
    }
}

// Initialize
const filterSortManager = new FilterSortManager();
