// Theme management
class ThemeManager {
    constructor() {
        // Set theme immediately to prevent flash
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.setThemeAttribute(this.theme);
        
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle?.querySelector('.btn__icon');
        this.themeText = this.themeToggle?.querySelector('.btn__text');
        
        this.init();
    }
    
    init() {
        this.updateToggleButton();
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    getStoredTheme() {
        return localStorage.getItem('theme');
    }
    
    setThemeAttribute(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.setThemeAttribute(theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton();
    }
    
    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    updateToggleButton() {
        if (!this.themeToggle) return;
        
        if (this.theme === 'dark') {
            // Use absolute path from root so it works from any directory level
            this.themeIcon.src = '/images/icon-sun-solid-full.svg';
            this.themeText.textContent = 'Light';
            this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            // Use absolute path from root so it works from any directory level
            this.themeIcon.src = '/images/icon-moon-solid-full.svg';
            this.themeText.textContent = 'Dark';
            this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
}

// Initialize theme manager immediately
const themeManager = new ThemeManager();

// Add keyboard navigation enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard navigation enhancements
    document.addEventListener('keydown', (e) => {
        // Skip to main content with Alt+M
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        }
    });
});