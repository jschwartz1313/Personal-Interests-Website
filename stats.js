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
    const chart = document.getElementById('rating-chart');
    chart.innerHTML = '';

    const maxCount = Math.max(...Object.values(stats.ratingDistribution), 1);

    for (let rating = 5; rating >= 1; rating--) {
        const count = stats.ratingDistribution[rating];
        const percentage = (count / maxCount) * 100;

        const barItem = document.createElement('div');
        barItem.className = 'bar-item';
        barItem.innerHTML = `
            <div class="bar-label">${'⭐'.repeat(rating)}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${percentage}%">${count}</div>
            </div>
        `;
        chart.appendChild(barItem);
    }
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
