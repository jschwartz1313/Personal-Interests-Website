// ========================================
// ACTIVITY TRACKING SYSTEM
// ========================================

class ActivityTracker {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addLastEngagedTracking();
            this.trackCardInteractions();
        });
    }

    // Log activity whenever user interacts with a card
    trackCardInteractions() {
        // Track when cards are expanded
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.card, .expandable-card');
            if (card && card.dataset.cardId) {
                this.logActivity(card.dataset.cardId, 'view');
            }
        });

        // Track when ratings are changed
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const card = e.target.closest('.card, .expandable-card');
                if (card && card.dataset.cardId) {
                    this.logActivity(card.dataset.cardId, 'rate');
                }
            }
        });

        // Track when notes are saved
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('save-notes-btn')) {
                const card = e.target.closest('.card, .expandable-card');
                if (card && card.dataset.cardId) {
                    this.logActivity(card.dataset.cardId, 'note');
                }
            }
        });

        // Track when priority is set
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('priority-btn')) {
                const card = e.target.closest('.card, .expandable-card');
                if (card && card.dataset.cardId) {
                    this.logActivity(card.dataset.cardId, 'priority');
                }
            }
        });

        // Track when tags are added
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-btn') && !e.target.classList.contains('tag-filter-btn')) {
                const card = e.target.closest('.card, .expandable-card');
                if (card && card.dataset.cardId) {
                    this.logActivity(card.dataset.cardId, 'tag');
                }
            }
        });
    }

    // Log an activity
    logActivity(cardId, type) {
        const now = new Date().toISOString();

        // Update last engaged timestamp
        localStorage.setItem(`last_engaged_${cardId}`, now);

        // Get activity history
        let history = JSON.parse(localStorage.getItem('activity_history') || '[]');

        // Add new activity
        history.push({
            cardId: cardId,
            type: type,
            timestamp: now,
            date: new Date().toLocaleDateString()
        });

        // Keep only last 1000 activities
        if (history.length > 1000) {
            history = history.slice(-1000);
        }

        localStorage.setItem('activity_history', JSON.stringify(history));
    }

    // Get last engaged date for a card
    getLastEngaged(cardId) {
        const timestamp = localStorage.getItem(`last_engaged_${cardId}`);
        return timestamp ? new Date(timestamp) : null;
    }

    // Add "Last engaged" display to cards
    addLastEngagedTracking() {
        const cards = document.querySelectorAll('.card, .expandable-card');

        cards.forEach(card => {
            if (!card.dataset.cardId) return;

            const lastEngaged = this.getLastEngaged(card.dataset.cardId);

            if (lastEngaged) {
                const daysAgo = this.getDaysAgo(lastEngaged);
                const badge = document.createElement('div');
                badge.className = 'last-engaged-badge';
                badge.innerHTML = `Last activity: ${this.formatDaysAgo(daysAgo)}`;

                // Add to card header
                const cardHeader = card.querySelector('h3');
                if (cardHeader && !card.querySelector('.last-engaged-badge')) {
                    const container = document.createElement('div');
                    container.style.display = 'flex';
                    container.style.justifyContent = 'space-between';
                    container.style.alignItems = 'center';
                    container.style.width = '100%';

                    cardHeader.parentNode.insertBefore(container, cardHeader);
                    container.appendChild(cardHeader);
                    container.appendChild(badge);
                }
            }
        });
    }

    getDaysAgo(date) {
        const now = new Date();
        const diff = now - date;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    formatDaysAgo(days) {
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    }

    // Get activity history
    getActivityHistory() {
        return JSON.parse(localStorage.getItem('activity_history') || '[]');
    }

    // Get activities for specific date range
    getActivitiesInRange(startDate, endDate) {
        const history = this.getActivityHistory();
        return history.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= startDate && activityDate <= endDate;
        });
    }

    // Get heatmap data for the last 365 days
    getHeatmapData() {
        const history = this.getActivityHistory();
        const heatmap = {};

        // Initialize last 365 days
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            heatmap[dateStr] = 0;
        }

        // Count activities per day
        history.forEach(activity => {
            const dateStr = activity.timestamp.split('T')[0];
            if (heatmap.hasOwnProperty(dateStr)) {
                heatmap[dateStr]++;
            }
        });

        return heatmap;
    }

    // Get activity stats
    getStats() {
        const history = this.getActivityHistory();
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        return {
            total: history.length,
            thisWeek: history.filter(a => new Date(a.timestamp) > weekAgo).length,
            thisMonth: history.filter(a => new Date(a.timestamp) > monthAgo).length,
            byType: this.groupByType(history),
            mostActive: this.getMostActiveInterest(history)
        };
    }

    groupByType(history) {
        const grouped = {};
        history.forEach(activity => {
            grouped[activity.type] = (grouped[activity.type] || 0) + 1;
        });
        return grouped;
    }

    getMostActiveInterest(history) {
        const byCard = {};
        history.forEach(activity => {
            byCard[activity.cardId] = (byCard[activity.cardId] || 0) + 1;
        });

        let maxCard = null;
        let maxCount = 0;
        for (const [cardId, count] of Object.entries(byCard)) {
            if (count > maxCount) {
                maxCount = count;
                maxCard = cardId;
            }
        }

        return { cardId: maxCard, count: maxCount };
    }
}

// Initialize
const activityTracker = new ActivityTracker();
