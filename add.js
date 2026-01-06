// Auto-update preview as user types
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-interest-form');
    const titleInput = document.getElementById('interest-title');
    const iconInput = document.getElementById('interest-icon');
    const introInput = document.getElementById('interest-intro');

    // Live preview updates
    titleInput.addEventListener('input', updatePreview);
    iconInput.addEventListener('input', updatePreview);
    introInput.addEventListener('input', updatePreview);

    // Form submission
    form.addEventListener('submit', handleSubmit);
});

function updatePreview() {
    const title = document.getElementById('interest-title').value || 'Your Interest Title';
    const icon = document.getElementById('interest-icon').value || '🎯';
    const intro = document.getElementById('interest-intro').value || 'Your introduction will appear here...';

    const preview = document.getElementById('preview-content');
    preview.querySelector('.card-icon').textContent = icon;
    preview.querySelector('h3').textContent = title;
    preview.querySelector('.card-intro').textContent = intro;

    // Update sections
    const sections = document.querySelectorAll('.section-item');
    let detailsHTML = '';
    sections.forEach(section => {
        const sectionTitle = section.querySelector('.section-title').value;
        const sectionContent = section.querySelector('.section-content').value;
        if (sectionTitle && sectionContent) {
            detailsHTML += `<h4>${sectionTitle}</h4><p>${sectionContent}</p>`;
        }
    });

    if (detailsHTML) {
        preview.querySelector('.card-details').innerHTML = detailsHTML;
    } else {
        preview.querySelector('.card-details').innerHTML = '<p>Add sections to see them here!</p>';
    }
}

function addSection() {
    const container = document.getElementById('sections-container');
    const sectionHTML = `
        <div class="section-item">
            <input type="text" class="section-title" placeholder="Section Title (e.g., Why I Love It)">
            <textarea class="section-content" rows="3" placeholder="Detailed content for this section..."></textarea>
            <button type="button" class="remove-section-btn" onclick="removeSection(this)">Remove</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', sectionHTML);
}

function removeSection(btn) {
    btn.closest('.section-item').remove();
    updatePreview();
}

function addMediaItem() {
    const container = document.getElementById('media-container');
    const mediaHTML = `
        <div class="media-item">
            <input type="text" class="media-name" placeholder="Item name">
            <input type="url" class="media-url" placeholder="https://...">
            <button type="button" class="remove-media-btn" onclick="removeMedia(this)">Remove</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', mediaHTML);
}

function removeMedia(btn) {
    btn.closest('.media-item').remove();
}

function addLink() {
    const container = document.getElementById('links-container');
    const linkHTML = `
        <div class="link-item">
            <input type="text" class="link-label" placeholder="Label">
            <input type="url" class="link-url" placeholder="https://...">
            <button type="button" class="remove-link-btn" onclick="removeLink(this)">×</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', linkHTML);
}

function removeLink(btn) {
    btn.closest('.link-item').remove();
}

function previewInterest() {
    updatePreview();
    document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
}

function handleSubmit(e) {
    e.preventDefault();

    // Collect form data
    const formData = {
        title: document.getElementById('interest-title').value,
        category: document.getElementById('interest-category').value,
        icon: document.getElementById('interest-icon').value || '🎯',
        intro: document.getElementById('interest-intro').value,
        image: document.getElementById('interest-image').value,
        sections: [],
        media: [],
        links: []
    };

    // Collect sections
    document.querySelectorAll('.section-item').forEach(section => {
        const title = section.querySelector('.section-title').value;
        const content = section.querySelector('.section-content').value;
        if (title && content) {
            formData.sections.push({ title, content });
        }
    });

    // Collect media
    document.querySelectorAll('.media-item').forEach(item => {
        const name = item.querySelector('.media-name').value;
        const url = item.querySelector('.media-url').value;
        if (name && url) {
            formData.media.push({ name, url });
        }
    });

    // Collect links
    document.querySelectorAll('.link-item').forEach(item => {
        const label = item.querySelector('.link-label').value;
        const url = item.querySelector('.link-url').value;
        if (label && url) {
            formData.links.push({ label, url });
        }
    });

    // Save to localStorage
    const interests = JSON.parse(localStorage.getItem('custom-interests') || '[]');
    formData.id = `custom-${Date.now()}`;
    formData.createdAt = new Date().toISOString();
    interests.push(formData);
    localStorage.setItem('custom-interests', JSON.stringify(interests));

    // Show success message
    showSuccess();

    // Reset form
    document.getElementById('add-interest-form').reset();
    updatePreview();
}

function showSuccess() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <h3>✅ Interest Created!</h3>
        <p>Your interest has been saved successfully.</p>
        <p style="margin-top: 0.5rem;"><a href="index.html" style="color: white; text-decoration: underline;">Go to Home</a></p>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 4000);
}
