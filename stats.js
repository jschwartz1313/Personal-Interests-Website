document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});

function loadStats() {
    // Get all ratings and notes from localStorage
    const allData = {
        ratings: {},
        notes: {},
        mediaRatings: {}
    };

    // Parse localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (key.startsWith('rating-')) {
            allData.ratings[key.replace('rating-', '')] = parseInt(value);
        } else if (key.startsWith('notes-')) {
            allData.notes[key.replace('notes-', '')] = value;
        } else if (key.startsWith('item-rating-')) {
            allData.mediaRatings[key.replace('item-rating-', '')] = parseInt(value);
        }
    }

    // Calculate stats
    const stats = calculateStats(allData);

    // Update UI
    updateOverview(stats);
    updateCategoryBreakdown(stats);
    updateTopRated(stats);
    updateRatingDistribution(stats);
    updateActivity(stats);
    updateFunFacts(stats);
}

function calculateStats(allData) {
    const stats = {
        totalInterests: Object.keys(allData.ratings).length + Object.keys(allData.notes).length,
        totalRated: Object.keys(allData.ratings).length,
        totalNotes: Object.keys(allData.notes).length,
        totalMediaItems: Object.keys(allData.mediaRatings).length,
        avgRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        topRated: [],
        categories: {
            'Fandoms': 0,
            'Movies & TV': 0,
            'Crafts': 0,
            'Sports': 0,
            'Energy': 0,
            'Society': 0,
            'Technology': 0
        }
    };

    // Remove duplicates
    const uniqueInterests = new Set([...Object.keys(allData.ratings), ...Object.keys(allData.notes)]);
    stats.totalInterests = uniqueInterests.size;

    // Calculate average rating
    const ratings = Object.values(allData.ratings);
    if (ratings.length > 0) {
        stats.avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    }

    // Rating distribution
    ratings.forEach(rating => {
        stats.ratingDistribution[rating]++;
    });

    // Top rated items
    const ratedItems = Object.entries(allData.ratings)
        .map(([id, rating]) => ({ id, rating }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

    stats.topRated = ratedItems.map(item => ({
        id: item.id,
        rating: item.rating,
        name: formatName(item.id)
    }));

    // Category counting (simplified based on known IDs)
    Object.keys(allData.ratings).forEach(id => {
        if (['lotr', 'avatar', 'starwars', 'mcu'].includes(id)) stats.categories['Fandoms']++;
        else if (id.includes('college') || id.includes('nfl') || id.includes('nba')) stats.categories['Sports']++;
        else if (id.includes('energy') || id.includes('renewable')) stats.categories['Energy']++;
        else if (id.includes('politics') || id.includes('culture')) stats.categories['Society']++;
        else if (id.includes('technology') || id.includes('artificial')) stats.categories['Technology']++;
    });

    return stats;
}

function formatName(id) {
    // Convert IDs to readable names
    const names = {
        'lotr': 'Lord of the Rings',
        'avatar': 'Avatar: The Last Airbender',
        'starwars': 'Star Wars',
        'mcu': 'Marvel Cinematic Universe',
        'college-basketball': 'College Basketball',
        'nfl': 'NFL',
        'energy-systems': 'Energy Systems',
        'renewable-energy': 'Renewable Energy',
        'politics-governance': 'Politics & Governance',
        'culture-society': 'Culture & Society',
        'technology': 'Technology',
        'artificial-intelligence': 'Artificial Intelligence'
    };
    return names[id] || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function updateOverview(stats) {
    document.getElementById('total-interests').textContent = stats.totalInterests;
    document.getElementById('total-rated').textContent = stats.totalRated;
    document.getElementById('total-notes').textContent = stats.totalNotes;
    document.getElementById('avg-rating').textContent = stats.avgRating + '⭐';
}

function updateCategoryBreakdown(stats) {
    const grid = document.getElementById('category-grid');
    const icons = {
        'Fandoms': '🎬',
        'Movies & TV': '📺',
        'Crafts': '🧱',
        'Sports': '🏀',
        'Energy': '⚡',
        'Society': '🏛️',
        'Technology': '💻'
    };

    grid.innerHTML = '';
    Object.entries(stats.categories).forEach(([category, count]) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-icon">${icons[category]}</div>
            <h4>${category}</h4>
            <div class="category-count">${count}</div>
            <div class="category-label">interests</div>
        `;
        grid.appendChild(item);
    });
}

function updateTopRated(stats) {
    const grid = document.getElementById('top-rated-grid');
    grid.innerHTML = '';

    if (stats.topRated.length === 0) {
        grid.innerHTML = '<p style="color: #666; text-align: center; grid-column: 1/-1;">No rated interests yet! Start rating your interests.</p>';
        return;
    }

    stats.topRated.forEach((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        const itemEl = document.createElement('div');
        itemEl.className = 'top-rated-item';
        itemEl.innerHTML = `
            <div class="rank">${medal}</div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="stars">${'⭐'.repeat(item.rating)}</div>
            </div>
        `;
        grid.appendChild(itemEl);
    });
}

function updateRatingDistribution(stats) {
    const canvas = document.getElementById('rating-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (window.ratingChart) {
        window.ratingChart.destroy();
    }

    window.ratingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Interests',
                data: [
                    stats.ratingDistribution[1],
                    stats.ratingDistribution[2],
                    stats.ratingDistribution[3],
                    stats.ratingDistribution[4],
                    stats.ratingDistribution[5]
                ],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)'
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(230, 126, 34, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'How You Rate Your Interests',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });

    // Create category chart
    createCategoryChart(stats);
}

function createCategoryChart(stats) {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }

    const categories = Object.keys(stats.categories);
    const counts = Object.values(stats.categories);

    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: counts,
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(26, 188, 156, 0.8)'
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
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Distribution by Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function updateActivity(stats) {
    const timeline = document.getElementById('activity-timeline');
    const activities = [];

    // Generate some activity based on localStorage timestamps
    const recentKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('rating-') || key.startsWith('notes-')) {
            recentKeys.push(key);
        }
    }

    if (recentKeys.length === 0) {
        timeline.innerHTML = '<p style="color: #666; text-align: center;">No activity yet. Start exploring your interests!</p>';
        return;
    }

    // Show last 5 activities
    recentKeys.slice(-5).reverse().forEach(key => {
        const type = key.startsWith('rating-') ? 'Rated' : 'Added notes to';
        const name = formatName(key.replace('rating-', '').replace('notes-', ''));

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-time">Recently</div>
            <div class="activity-text">${type} <strong>${name}</strong></div>
        `;
        timeline.appendChild(item);
    });
}

function updateFunFacts(stats) {
    const grid = document.getElementById('fun-facts');

    const facts = [
        {
            icon: '🎯',
            value: stats.totalInterests,
            label: 'Total Passions Tracked'
        },
        {
            icon: '📊',
            value: `${Math.round((stats.totalRated / Math.max(stats.totalInterests, 1)) * 100)}%`,
            label: 'Interests Rated'
        },
        {
            icon: '✍️',
            value: stats.totalNotes,
            label: 'Personal Notes Written'
        },
        {
            icon: '🎬',
            value: stats.totalMediaItems,
            label: 'Media Items Tracked'
        }
    ];

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];

    grid.innerHTML = '';
    facts.forEach((fact, index) => {
        const card = document.createElement('div');
        card.className = 'fun-fact-card';
        card.style.background = gradients[index];
        card.innerHTML = `
            <div class="fact-icon">${fact.icon}</div>
            <div class="fact-value">${fact.value}</div>
            <div class="fact-label">${fact.label}</div>
        `;
        grid.appendChild(card);
    });
}
