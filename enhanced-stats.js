// ========================================
// ENHANCED STATISTICS & VISUALIZATIONS
// ========================================

class EnhancedStats {
    constructor() {
        this.init();
    }

    init() {
        if (window.location.pathname.includes('stats.html')) {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadEnhancedStats();
            });
        }
    }

    loadEnhancedStats() {
        // Wait for base stats to load first
        setTimeout(() => {
            this.createActivityHeatmap();
            this.createTagCloud();
            this.createPriorityDistribution();
            this.createInsightsPanel();
            this.createTrendingInterests();
        }, 500);
    }

    // Create activity heatmap (like GitHub contributions)
    createActivityHeatmap() {
        const container = document.getElementById('activity-heatmap');
        if (!container) return;

        const heatmapData = window.activityTracker?.getHeatmapData() || {};
        const dates = Object.keys(heatmapData).sort();

        if (dates.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No activity data yet. Start interacting with your interests!</p>';
            return;
        }

        container.innerHTML = '<h3>📅 Activity Heatmap (Last 90 Days)</h3><div class="heatmap-grid" id="heatmap-grid"></div>';

        const grid = document.getElementById('heatmap-grid');
        const last90Days = dates.slice(-90);

        last90Days.forEach(dateStr => {
            const count = heatmapData[dateStr];
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.dataset.count = count;
            cell.dataset.date = dateStr;
            cell.title = `${dateStr}: ${count} activities`;

            // Color intensity based on activity count
            if (count === 0) cell.classList.add('level-0');
            else if (count <= 2) cell.classList.add('level-1');
            else if (count <= 5) cell.classList.add('level-2');
            else if (count <= 10) cell.classList.add('level-3');
            else cell.classList.add('level-4');

            grid.appendChild(cell);
        });
    }

    // Create tag cloud visualization
    createTagCloud() {
        const container = document.getElementById('tag-cloud');
        if (!container) return;

        const tagCounts = {};

        // Count all tags across all cards
        const allCards = document.querySelectorAll('[data-card-id]');
        allCards.forEach(card => {
            const cardId = card.dataset.cardId;
            const tags = JSON.parse(localStorage.getItem(`tags_${cardId}`) || '[]');
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        if (Object.keys(tagCounts).length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No tags yet! Start tagging your interests.</p>';
            return;
        }

        container.innerHTML = '<h3>🏷️ Tag Cloud</h3><div class="tag-cloud-container" id="tag-cloud-items"></div>';

        const cloudContainer = document.getElementById('tag-cloud-items');
        const maxCount = Math.max(...Object.values(tagCounts));

        Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([tag, count]) => {
                const size = 0.8 + (count / maxCount) * 1.5; // Scale from 0.8 to 2.3em
                const tagEl = document.createElement('span');
                tagEl.className = 'cloud-tag';
                tagEl.textContent = tag;
                tagEl.style.fontSize = `${size}em`;
                tagEl.title = `Used ${count} time${count !== 1 ? 's' : ''}`;
                cloudContainer.appendChild(tagEl);
            });
    }

    // Create priority distribution pie chart
    createPriorityDistribution() {
        const container = document.getElementById('priority-distribution');
        if (!container) return;

        const priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };

        // Count priorities
        const allCards = document.querySelectorAll('[data-card-id]');
        allCards.forEach(card => {
            const cardId = card.dataset.cardId;
            const priority = localStorage.getItem(`priority_${cardId}`) || 'none';
            priorityCounts[priority]++;
        });

        const total = Object.values(priorityCounts).reduce((a, b) => a + b, 0);

        if (total === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No priorities set yet!</p>';
            return;
        }

        container.innerHTML = '<h3>🎯 Priority Distribution</h3><canvas id="priority-chart" width="400" height="400"></canvas>';

        const canvas = document.getElementById('priority-chart');
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    `🔥 High Priority (${priorityCounts.high})`,
                    `⭐ Medium Priority (${priorityCounts.medium})`,
                    `💤 Low Priority (${priorityCounts.low})`,
                    `No Priority (${priorityCounts.none})`
                ],
                datasets: [{
                    data: [
                        priorityCounts.high,
                        priorityCounts.medium,
                        priorityCounts.low,
                        priorityCounts.none
                    ],
                    backgroundColor: [
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(149, 165, 166, 0.8)',
                        'rgba(236, 240, 241, 0.8)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }

    // Create insights and recommendations
    createInsightsPanel() {
        const container = document.getElementById('insights-panel');
        if (!container) return;

        const insights = this.generateInsights();

        if (insights.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">Not enough data for insights yet. Keep exploring!</p>';
            return;
        }

        container.innerHTML = '<h3>💡 Insights & Recommendations</h3><div class="insights-list" id="insights-list"></div>';

        const list = document.getElementById('insights-list');

        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            `;
            list.appendChild(item);
        });
    }

    generateInsights() {
        const insights = [];

        // Analyze tags
        const tagCounts = {};
        const allCards = document.querySelectorAll('[data-card-id]');

        allCards.forEach(card => {
            const cardId = card.dataset.cardId;
            const tags = JSON.parse(localStorage.getItem(`tags_${cardId}`) || '[]');
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Find most common tags
        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topTags.length > 0) {
            const tagNames = topTags.map(t => t[0]).join(', ');
            insights.push({
                icon: '🎯',
                title: 'Your Preferences',
                message: `You seem to love ${tagNames} activities! These are your most common tags.`
            });
        }

        // Check for high priority items
        let highPriorityCount = 0;
        allCards.forEach(card => {
            const priority = localStorage.getItem(`priority_${card.dataset.cardId}`);
            if (priority === 'high') highPriorityCount++;
        });

        if (highPriorityCount > 0) {
            insights.push({
                icon: '🔥',
                title: 'Focus Areas',
                message: `You have ${highPriorityCount} high-priority interest${highPriorityCount !== 1 ? 's' : ''}. Make time for what matters most!`
            });
        }

        // Check for unrated interests
        let unratedCount = 0;
        allCards.forEach(card => {
            const rating = localStorage.getItem(`rating_${card.dataset.cardId}`);
            if (!rating) unratedCount++;
        });

        if (unratedCount > 5) {
            insights.push({
                icon: '⭐',
                title: 'Rate Your Interests',
                message: `You have ${unratedCount} interests that haven't been rated yet. Take a moment to rate them!`
            });
        }

        // Check activity levels
        if (window.activityTracker) {
            const stats = window.activityTracker.getStats();
            if (stats.thisWeek > 10) {
                insights.push({
                    icon: '🚀',
                    title: 'Super Active!',
                    message: `Wow! You've had ${stats.thisWeek} interactions this week. Keep up the momentum!`
                });
            } else if (stats.thisWeek === 0) {
                insights.push({
                    icon: '💤',
                    title: 'Time to Explore',
                    message: `No activity this week. Pick a random interest and dive in!`
                });
            }
        }

        // Check for neglected interests
        const now = new Date();
        let neglectedCount = 0;
        allCards.forEach(card => {
            const lastEngaged = localStorage.getItem(`last_engaged_${card.dataset.cardId}`);
            if (lastEngaged) {
                const daysSince = (now - new Date(lastEngaged)) / (1000 * 60 * 60 * 24);
                if (daysSince > 30) neglectedCount++;
            }
        });

        if (neglectedCount > 3) {
            insights.push({
                icon: '🕐',
                title: 'Forgotten Interests',
                message: `${neglectedCount} interests haven't been engaged with in over 30 days. Maybe revisit them?`
            });
        }

        return insights;
    }

    // Create trending interests section
    createTrendingInterests() {
        const container = document.getElementById('trending-interests');
        if (!container) return;

        if (!window.activityTracker) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No trending data available yet.</p>';
            return;
        }

        const history = window.activityTracker.getActivityHistory();
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Count activities per card in last week
        const recentActivity = {};
        history
            .filter(a => new Date(a.timestamp) > weekAgo)
            .forEach(activity => {
                recentActivity[activity.cardId] = (recentActivity[activity.cardId] || 0) + 1;
            });

        const trending = Object.entries(recentActivity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (trending.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">No recent activity. Start exploring!</p>';
            return;
        }

        container.innerHTML = '<h3>🔥 Trending This Week</h3><div class="trending-list" id="trending-list"></div>';

        const list = document.getElementById('trending-list');

        trending.forEach(([cardId, count], index) => {
            const card = document.querySelector(`[data-card-id="${cardId}"]`);
            const name = card?.querySelector('h3')?.textContent || cardId;

            const item = document.createElement('div');
            item.className = 'trending-item';
            item.innerHTML = `
                <div class="trending-rank">#${index + 1}</div>
                <div class="trending-info">
                    <h4>${name}</h4>
                    <p>${count} interaction${count !== 1 ? 's' : ''} this week</p>
                </div>
            `;
            list.appendChild(item);
        });
    }
}

// Initialize
const enhancedStats = new EnhancedStats();
