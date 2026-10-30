// Site root, worked out from this script's own URL (js/theme-toggle.js sits one
// folder below the root). Icon paths built from it work on GitHub Pages
// (/art-appreciation-hour/), on a local server, and from pages in subfolders.
const SITE_ROOT = document.currentScript
    ? document.currentScript.src.replace(/js\/theme-toggle\.js(\?.*)?$/, '')
    : '';

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
            // Built from the site root so it works on GitHub Pages and in subfolders
            this.themeIcon.src = SITE_ROOT + 'images/icon-sun-solid-full.svg';
            this.themeText.textContent = 'Light';
            this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            // Built from the site root so it works on GitHub Pages and in subfolders
            this.themeIcon.src = SITE_ROOT + 'images/icon-moon-solid-full.svg';
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