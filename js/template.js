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

// Update page title and header
document.addEventListener('DOMContentLoaded', () => {
    const toolName = document.querySelector('h1').textContent;
    document.title = `${toolName} - Background Remover & Tools Hub`;
});

// Load related tools
function loadRelatedTools() {
    const currentTool = window.location.pathname.split('/').pop();
    const relatedToolsContainer = document.querySelector('.related-tools');
    
    // Get tools from the main page's tools array
    fetch('../index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const toolsScript = doc.querySelector('script:contains("const tools =")');
            if (toolsScript) {
                const toolsText = toolsScript.textContent;
                const toolsMatch = toolsText.match(/const tools = (\[.*?\]);/s);
                if (toolsMatch) {
                    const tools = JSON.parse(toolsMatch[1]);
                    const currentToolData = tools.find(tool => tool.link.includes(currentTool));
                    if (currentToolData) {
                        const relatedTools = tools
                            .filter(tool => 
                                tool.category === currentToolData.category && 
                                tool.link !== currentToolData.link
                            )
                            .slice(0, 3);
                        
                        relatedToolsContainer.innerHTML = relatedTools.map(tool => `
                            <div class="related-tool mb-2">
                                <a href="${tool.link}" class="text-decoration-none">
                                    <div class="d-flex align-items-center">
                                        <i class="${tool.icon} me-2"></i>
                                        <span>${tool.title}</span>
                                    </div>
                                </a>
                            </div>
                        `).join('');
                    }
                }
            }
        })
        .catch(error => console.error('Error loading related tools:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRelatedTools();
}); 