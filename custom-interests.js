// Load and render custom interests from localStorage
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadCustomInterests();
    }, 100);
});

function loadCustomInterests() {
    const customInterests = JSON.parse(localStorage.getItem('custom-interests') || '[]');

    if (customInterests.length === 0) {
        console.log('No custom interests found');
        return;
    }

    console.log(`Loading ${customInterests.length} custom interests`);

    // Group by category
    const categorySections = {
        'fandoms': '#fandoms',
        'movies': '#movies-tv',
        'crafts': '#crafts',
        'sports': '#sports',
        'energy': '#energy',
        'society': '#society',
        'technology': '#technology'
    };

    customInterests.forEach(interest => {
        const sectionSelector = categorySections[interest.category];
        if (!sectionSelector) {
            console.warn('Unknown category:', interest.category);
            return;
        }

        const section = document.querySelector(sectionSelector);
        if (!section) {
            console.warn('Section not found:', sectionSelector);
            return;
        }

        const cardGrid = section.querySelector('.card-grid');
        if (!cardGrid) {
            console.warn('Card grid not found in section:', sectionSelector);
            return;
        }

        // Create the card
        const card = createCustomCard(interest);
        cardGrid.appendChild(card);

        // Animate it in
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, 0);
    });

    // Re-initialize expandable cards for new custom cards
    reinitializeCustomCards();
}

function createCustomCard(interest) {
    const card = document.createElement('div');
    card.className = 'card expandable-card';
    card.dataset.cardId = interest.id;

    // Build sections HTML
    let sectionsHTML = '';
    if (interest.sections && interest.sections.length > 0) {
        interest.sections.forEach(section => {
            sectionsHTML += `
                <h4>${section.title}</h4>
                <p>${section.content}</p>
            `;
        });
    }

    // Build quick links HTML
    let linksHTML = '';
    if (interest.links && interest.links.length > 0) {
        linksHTML = '<div class="quick-links">';
        interest.links.forEach(link => {
            linksHTML += `<a href="${link.url}" target="_blank" rel="noopener" class="external-link">${link.label}</a>`;
        });
        linksHTML += '</div>';
    }

    // Build media HTML
    let mediaHTML = '';
    if (interest.media && interest.media.length > 0) {
        mediaHTML = `
            <h4>📚 Related Media</h4>
            <div class="media-list">
        `;
        interest.media.forEach((item, index) => {
            const itemId = `${interest.id}-media-${index}`;
            mediaHTML += `
                <div class="media-item" data-item-id="${itemId}">
                    <input type="checkbox" class="watched-checkbox">
                    <a href="${item.url}" target="_blank">${item.name}</a>
                    <span class="item-rating"></span>
                </div>
            `;
        });
        mediaHTML += '</div>';
    }

    card.innerHTML = `
        <div class="card-icon">${interest.icon}</div>
        <h3>${interest.title}</h3>
        <div class="card-rating">
            <div class="stars">
                <span class="star" data-value="1">★</span>
                <span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span>
                <span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
            </div>
            <span class="rating-text">Rate this interest</span>
        </div>
        <div class="card-content">
            <p class="card-intro">${interest.intro}</p>
            ${linksHTML}
            <div class="card-details">
                ${sectionsHTML}
                ${mediaHTML}
            </div>
            <div class="personal-notes">
                <h4>📝 My Notes</h4>
                <textarea class="notes-input" placeholder="Add your personal thoughts, favorite quotes, or memories here..."></textarea>
                <button class="save-notes-btn">Save Notes</button>
            </div>
        </div>
        <div class="custom-badge">Custom</div>
    `;

    return card;
}

function reinitializeCustomCards() {
    const customCards = document.querySelectorAll('[data-card-id^="custom-"]');

    customCards.forEach(card => {
        // Add click handler for expansion
        card.addEventListener('click', function(e) {
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

            this.classList.toggle('expanded');
        }, false);

        // Initialize rating system
        if (card.querySelector('.card-rating')) {
            new StarRating(card);
        }

        // Initialize notes system
        if (card.querySelector('.personal-notes')) {
            new PersonalNotes(card);
        }
    });

    // Initialize media tracking for custom cards
    setTimeout(() => {
        initMediaTracking();
    }, 200);
}

// Add delete functionality for custom interests
function deleteCustomInterest(interestId) {
    const confirmed = confirm('Are you sure you want to delete this custom interest?');
    if (!confirmed) return;

    const interests = JSON.parse(localStorage.getItem('custom-interests') || '[]');
    const filtered = interests.filter(i => i.id !== interestId);
    localStorage.setItem('custom-interests', JSON.stringify(filtered));

    // Remove from DOM
    const card = document.querySelector(`[data-card-id="${interestId}"]`);
    if (card) {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.remove(), 300);
    }

    showNotification('Custom interest deleted');
}
