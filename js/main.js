// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Background Removal Functionality
const imageInput = document.getElementById('image-input');
const uploadSection = document.querySelector('.upload-section');
const previewSection = document.getElementById('preview-section');
const originalPreview = document.getElementById('original-preview');
const processedPreview = document.getElementById('processed-preview');
const downloadBtn = document.getElementById('download-btn');

// API Key for background removal service
const API_KEY = 'NJ571ej2SrDDQ2YrRrWJ9sjh';

// Drag and drop functionality
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--primary-color)';
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.style.borderColor = 'var(--border-color)';
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

function handleImageUpload(file) {
    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
    }

    // Show original image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        previewSection.classList.remove('d-none');
        removeBackground(file);
    };
    reader.readAsDataURL(file);
}

async function removeBackground(file) {
    try {
        // Show loading state
        processedPreview.src = 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';
        
        const formData = new FormData();
        formData.append('image_file', file);

        console.log('Sending request to remove.bg API...');
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to remove background: ${response.status} ${errorText}`);
        }

        console.log('Received response from API');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        processedPreview.src = url;

        // Setup download button with authentication check
        downloadBtn.onclick = () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Show login modal
                const loginModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
                loginModal.show();
                return;
            }
            
            // Proceed with download if authenticated
            const a = document.createElement('a');
            a.href = url;
            a.download = 'removed-bg.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    } catch (error) {
        console.error('Error removing background:', error);
        alert(`Failed to remove background: ${error.message}`);
        processedPreview.src = ''; // Clear the preview
    }
}

// Load tools data
const tools = [
    // Image Tools
    {
        title: 'Image Converter',
        icon: 'fas fa-image',
        description: 'Convert images between different formats',
        link: 'tools/image-converter.html',
        category: 'Image Tools'
    },
    {
        title: 'Image Resizer',
        icon: 'fas fa-compress-arrows-alt',
        description: 'Resize images to specific dimensions',
        link: 'tools/image-resizer.html',
        category: 'Image Tools'
    },
    {
        title: 'Image Compressor',
        icon: 'fas fa-file-image',
        description: 'Compress images to reduce file size',
        link: 'tools/image-compressor.html',
        category: 'Image Tools'
    },
    {
        title: 'Image Cropper',
        icon: 'fas fa-crop',
        description: 'Crop images to desired size',
        link: 'tools/image-cropper.html',
        category: 'Image Tools'
    },
    
    // Text Tools
    {
        title: 'Text to Speech',
        icon: 'fas fa-microphone',
        description: 'Convert text to speech',
        link: 'tools/text-to-speech.html',
        category: 'Text Tools'
    },
    {
        title: 'Word Counter',
        icon: 'fas fa-calculator',
        description: 'Count words and characters',
        link: 'tools/word-counter.html',
        category: 'Text Tools'
    },
    {
        title: 'Text Case Converter',
        icon: 'fas fa-font',
        description: 'Convert text between different cases',
        link: 'tools/text-case-converter.html',
        category: 'Text Tools'
    },
    {
        title: 'Password Generator',
        icon: 'fas fa-key',
        description: 'Generate secure passwords',
        link: 'tools/password-generator.html',
        category: 'Text Tools'
    },
    
    // Unit Converters
    {
        title: 'Unit Converter',
        icon: 'fas fa-exchange-alt',
        description: 'Convert between different units',
        link: 'tools/unit-converter.html',
        category: 'Unit Converters'
    },
    {
        title: 'Currency Converter',
        icon: 'fas fa-money-bill-wave',
        description: 'Convert between currencies',
        link: 'tools/currency-converter.html',
        category: 'Unit Converters'
    },
    {
        title: 'Time Zone Converter',
        icon: 'fas fa-clock',
        description: 'Convert between time zones',
        link: 'tools/timezone-converter.html',
        category: 'Unit Converters'
    },
    {
        title: 'Temperature Converter',
        icon: 'fas fa-thermometer-half',
        description: 'Convert between temperature units',
        link: 'tools/temperature-converter.html',
        category: 'Unit Converters'
    },
    
    // Developer Tools
    {
        title: 'JSON Formatter',
        icon: 'fas fa-code',
        description: 'Format and validate JSON',
        link: 'tools/json-formatter.html',
        category: 'Developer Tools'
    },
    {
        title: 'Base64 Encoder',
        icon: 'fas fa-lock',
        description: 'Encode/decode Base64',
        link: 'tools/base64-encoder.html',
        category: 'Developer Tools'
    },
    {
        title: 'HTML Formatter',
        icon: 'fas fa-file-code',
        description: 'Format HTML code',
        link: 'tools/html-formatter.html',
        category: 'Developer Tools'
    },
    {
        title: 'Color Picker',
        icon: 'fas fa-palette',
        description: 'Pick and convert colors',
        link: 'tools/color-picker.html',
        category: 'Developer Tools'
    },
    
    // SEO Tools
    {
        title: 'Meta Tag Generator',
        icon: 'fas fa-tags',
        description: 'Generate meta tags for SEO',
        link: 'tools/meta-tag-generator.html',
        category: 'SEO Tools'
    },
    {
        title: 'Keyword Density',
        icon: 'fas fa-chart-bar',
        description: 'Analyze keyword density',
        link: 'tools/keyword-density.html',
        category: 'SEO Tools'
    },
    {
        title: 'URL Encoder',
        icon: 'fas fa-link',
        description: 'Encode/decode URLs',
        link: 'tools/url-encoder.html',
        category: 'SEO Tools'
    },
    {
        title: 'Sitemap Generator',
        icon: 'fas fa-sitemap',
        description: 'Generate XML sitemaps',
        link: 'tools/sitemap-generator.html',
        category: 'SEO Tools'
    }
];

// Get unique categories
const categories = [...new Set(tools.map(tool => tool.category))];

// Populate tools grid with search and categories
function populateToolsGrid() {
    const toolsGrid = document.querySelector('.tools-grid');
    
    // Add search and category filters
    const filtersHtml = `
        <div class="filters mb-4">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="tool-search" class="form-control" placeholder="Search tools...">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="btn-group w-100" role="group">
                        <button type="button" class="btn btn-outline-primary active" data-category="all">All</button>
                        ${categories.map(category => `
                            <button type="button" class="btn btn-outline-primary" data-category="${category}">${category}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        <div class="row" id="tools-container">
            <!-- Tools will be dynamically loaded here -->
        </div>
    `;
    
    toolsGrid.innerHTML = filtersHtml;
    const toolsContainer = document.getElementById('tools-container');
    
    // Function to filter and display tools
    function displayTools(filteredTools) {
        toolsContainer.innerHTML = '';
        filteredTools.forEach(tool => {
            const toolCard = document.createElement('div');
            toolCard.className = 'col-md-4 col-lg-3 mb-4';
            toolCard.innerHTML = `
                <div class="card h-100 tool-card">
                    <div class="card-body text-center">
                        <div class="tool-icon mb-3">
                            <i class="${tool.icon} fa-3x"></i>
                        </div>
                        <h5 class="card-title">${tool.title}</h5>
                        <p class="card-text">${tool.description}</p>
                        <div class="tool-category mb-2">
                            <span class="badge bg-primary">${tool.category}</span>
                        </div>
                        <a href="${tool.link}" class="btn btn-primary">
                            <i class="fas fa-play me-2"></i>Use Tool
                        </a>
                    </div>
                </div>
            `;
            toolsContainer.appendChild(toolCard);
        });
    }
    
    // Initial display
    displayTools(tools);
    
    // Search functionality
    const searchInput = document.getElementById('tool-search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredTools = tools.filter(tool => 
            tool.title.toLowerCase().includes(searchTerm) ||
            tool.description.toLowerCase().includes(searchTerm) ||
            tool.category.toLowerCase().includes(searchTerm)
        );
        displayTools(filteredTools);
    });
    
    // Category filter functionality
    const categoryButtons = document.querySelectorAll('[data-category]');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter tools
            const category = button.dataset.category;
            const filteredTools = category === 'all' 
                ? tools 
                : tools.filter(tool => tool.category === category);
            displayTools(filteredTools);
        });
    });
}

// Initialize tools grid
populateToolsGrid();

// Add to existing code
document.addEventListener('DOMContentLoaded', function() {
    // Auth elements
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userNameElement = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const userAvatar = document.querySelector('.user-avatar');

    // Check authentication state
    function checkAuth() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            // User is logged in
            const user = JSON.parse(userData);
            showUserMenu(user);
        } else {
            // User is logged out
            showAuthButtons();
        }
    }

    // Show user menu
    function showUserMenu(user) {
        authButtons.classList.add('d-none');
        userMenu.classList.remove('d-none');
        userNameElement.textContent = user.name || 'User';
        if (user.avatar) {
            userAvatar.src = user.avatar;
        }
    }

    // Show auth buttons
    function showAuthButtons() {
        authButtons.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }

    // Handle logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Show auth buttons
        showAuthButtons();
        
        // Redirect to home page
        window.location.href = 'index.html';
    });

    // Check auth state on page load
    checkAuth();
}); 