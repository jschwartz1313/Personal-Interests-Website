// Gallery data with placeholder images from Unsplash
const galleryData = [
    {
        id: 'lotr',
        title: 'Lord of the Rings',
        category: 'fandoms',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop',
        description: 'Epic fantasy journey through Middle-earth'
    },
    {
        id: 'avatar',
        title: 'Avatar: The Last Airbender',
        category: 'fandoms',
        image: 'https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=600&h=400&fit=crop',
        description: 'Mastering the four elements'
    },
    {
        id: 'starwars',
        title: 'Star Wars',
        category: 'fandoms',
        image: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=600&h=400&fit=crop',
        description: 'A galaxy far, far away'
    },
    {
        id: 'mcu',
        title: 'Marvel Cinematic Universe',
        category: 'fandoms',
        image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=400&fit=crop',
        description: 'Earth\'s Mightiest Heroes'
    },
    {
        id: 'cinema',
        title: 'Cinema & Film',
        category: 'movies',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop',
        description: 'The magic of movies'
    },
    {
        id: 'streaming',
        title: 'Streaming Series',
        category: 'movies',
        image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop',
        description: 'Binge-worthy shows'
    },
    {
        id: 'lego',
        title: 'LEGO Building',
        category: 'crafts',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=400&fit=crop',
        description: 'Brick by brick creativity'
    },
    {
        id: 'basketball',
        title: 'College Basketball',
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
        description: 'March Madness and more'
    },
    {
        id: 'football',
        title: 'NFL Football',
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&fit=crop',
        description: 'Sunday gameday tradition'
    },
    {
        id: 'tech',
        title: 'Technology Innovation',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
        description: 'The digital future'
    },
    {
        id: 'ai',
        title: 'Artificial Intelligence',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
        description: 'The AI revolution'
    },
    {
        id: 'renewable',
        title: 'Renewable Energy',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
        description: 'Sustainable power for the future'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderGallery('all');
    setupFilters();
    setupLightbox();
});

function renderGallery(category) {
    const grid = document.getElementById('gallery-grid');
    const filteredData = category === 'all'
        ? galleryData
        : galleryData.filter(item => item.category === category);

    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>🖼️ No images in this category yet</h3>
                <p>Check back soon or try a different filter!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    filteredData.forEach(item => {
        const rating = localStorage.getItem(`rating-${item.id}`);
        const ratingStars = rating ? '⭐'.repeat(parseInt(rating)) : '';

        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.category = item.category;
        galleryItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${ratingStars ? `<div class="rating">${ratingStars}</div>` : ''}
            </div>
        `;

        galleryItem.addEventListener('click', () => openLightbox(item));
        grid.appendChild(galleryItem);

        // Add animation
        setTimeout(() => {
            galleryItem.style.opacity = '0';
            galleryItem.style.transform = 'translateY(20px)';
            galleryItem.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                galleryItem.style.opacity = '1';
                galleryItem.style.transform = 'translateY(0)';
            }, 50);
        }, 0);
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter gallery
            const category = btn.dataset.category;
            renderGallery(category);
        });
    });
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.lightbox-close');

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function openLightbox(item) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');

    image.src = item.image;
    caption.textContent = `${item.title} - ${item.description}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}
