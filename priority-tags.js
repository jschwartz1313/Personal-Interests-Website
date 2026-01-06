// ========================================
// PRIORITY & TAGS SYSTEM
// ========================================

class PriorityTagsManager {
    constructor() {
        this.priorities = {
            high: { icon: '🔥', label: 'High Priority', color: '#e74c3c' },
            medium: { icon: '⭐', label: 'Medium Priority', color: '#f39c12' },
            low: { icon: '💤', label: 'Low Priority', color: '#95a5a6' },
            none: { icon: '', label: 'No Priority', color: '#bdc3c7' }
        };

        this.availableTags = [
            'Weekend Activity',
            'Solo',
            'Social',
            'Indoor',
            'Outdoor',
            'Free',
            'Expensive',
            'Creative',
            'Physical',
            'Learning',
            'Relaxing',
            'Challenging'
        ];

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addPriorityAndTagsToCards();
            this.setupFilterControls();
        });
    }

    addPriorityAndTagsToCards() {
        const cards = document.querySelectorAll('.card, .expandable-card');

        cards.forEach(card => {
            if (!card.dataset.cardId) return;

            const cardContent = card.querySelector('.card-content');
            if (!cardContent) return;

            // Create priority and tags section
            const priorityTagsSection = document.createElement('div');
            priorityTagsSection.className = 'priority-tags-section';
            priorityTagsSection.innerHTML = `
                <div class="priority-selector">
                    <h4>🎯 Priority</h4>
                    <div class="priority-buttons">
                        <button class="priority-btn" data-priority="high" title="High Priority">
                            ${this.priorities.high.icon} High
                        </button>
                        <button class="priority-btn" data-priority="medium" title="Medium Priority">
                            ${this.priorities.medium.icon} Medium
                        </button>
                        <button class="priority-btn" data-priority="low" title="Low Priority">
                            ${this.priorities.low.icon} Low
                        </button>
                        <button class="priority-btn active" data-priority="none" title="No Priority">
                            None
                        </button>
                    </div>
                </div>

                <div class="tags-selector">
                    <h4>🏷️ Tags</h4>
                    <div class="tags-container">
                        ${this.availableTags.map(tag => `
                            <button class="tag-btn" data-tag="${tag}">${tag}</button>
                        `).join('')}
                    </div>
                    <div class="selected-tags"></div>
                </div>
            `;

            // Insert before notes section
            const notesSection = card.querySelector('.personal-notes');
            if (notesSection) {
                cardContent.insertBefore(priorityTagsSection, notesSection);
            } else {
                cardContent.appendChild(priorityTagsSection);
            }

            // Load saved data
            this.loadPriorityAndTags(card);

            // Add event listeners
            this.attachEventListeners(card);

            // Update card header badge
            this.updateCardBadge(card);
        });
    }

    attachEventListeners(card) {
        const cardId = card.dataset.cardId;

        // Priority buttons
        const priorityBtns = card.querySelectorAll('.priority-btn');
        priorityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                priorityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const priority = btn.dataset.priority;
                this.savePriority(cardId, priority);
                this.updateCardBadge(card);
            });
        });

        // Tag buttons
        const tagBtns = card.querySelectorAll('.tag-btn');
        tagBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.classList.toggle('active');

                const tag = btn.dataset.tag;
                this.toggleTag(cardId, tag);
                this.updateSelectedTags(card);
                this.updateCardBadge(card);
            });
        });
    }

    savePriority(cardId, priority) {
        const key = `priority_${cardId}`;
        localStorage.setItem(key, priority);
    }

    toggleTag(cardId, tag) {
        const key = `tags_${cardId}`;
        let tags = JSON.parse(localStorage.getItem(key) || '[]');

        if (tags.includes(tag)) {
            tags = tags.filter(t => t !== tag);
        } else {
            tags.push(tag);
        }

        localStorage.setItem(key, JSON.stringify(tags));
    }

    loadPriorityAndTags(card) {
        const cardId = card.dataset.cardId;

        // Load priority
        const priority = localStorage.getItem(`priority_${cardId}`) || 'none';
        const priorityBtn = card.querySelector(`.priority-btn[data-priority="${priority}"]`);
        if (priorityBtn) {
            card.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            priorityBtn.classList.add('active');
        }

        // Load tags
        const tags = JSON.parse(localStorage.getItem(`tags_${cardId}`) || '[]');
        tags.forEach(tag => {
            const tagBtn = card.querySelector(`.tag-btn[data-tag="${tag}"]`);
            if (tagBtn) {
                tagBtn.classList.add('active');
            }
        });

        this.updateSelectedTags(card);
    }

    updateSelectedTags(card) {
        const cardId = card.dataset.cardId;
        const tags = JSON.parse(localStorage.getItem(`tags_${cardId}`) || '[]');
        const selectedTagsContainer = card.querySelector('.selected-tags');

        if (tags.length > 0) {
            selectedTagsContainer.innerHTML = `
                <div class="selected-tags-list">
                    ${tags.map(tag => `<span class="selected-tag">${tag}</span>`).join('')}
                </div>
            `;
        } else {
            selectedTagsContainer.innerHTML = '';
        }
    }

    updateCardBadge(card) {
        const cardId = card.dataset.cardId;
        const priority = localStorage.getItem(`priority_${cardId}`) || 'none';

        // Remove existing badge
        const existingBadge = card.querySelector('.priority-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Add priority badge to card header
        if (priority !== 'none') {
            const badge = document.createElement('span');
            badge.className = 'priority-badge';
            badge.dataset.priority = priority;
            badge.innerHTML = this.priorities[priority].icon;
            badge.title = this.priorities[priority].label;

            const cardHeader = card.querySelector('h3');
            if (cardHeader) {
                cardHeader.appendChild(badge);
            }
        }
    }

    setupFilterControls() {
        // This will be called from the main filtering system
        // Exposes methods for filtering
    }

    getCardPriority(card) {
        const cardId = card.dataset.cardId;
        return localStorage.getItem(`priority_${cardId}`) || 'none';
    }

    getCardTags(card) {
        const cardId = card.dataset.cardId;
        return JSON.parse(localStorage.getItem(`tags_${cardId}`) || '[]');
    }
}

// Initialize
const priorityTagsManager = new PriorityTagsManager();
