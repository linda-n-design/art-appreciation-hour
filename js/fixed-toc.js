// fixed-toc.js - Makes the table of contents sidebar sticky on scroll
// Active class applied to <li> for background styling

(function() {
    'use strict';
    
    console.log('fixed-toc.js loaded');
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickySidebar);
    } else {
        initStickySidebar();
    }
    
    function initStickySidebar() {
        const sidebar = document.getElementById('toc-sidebar');
        console.log('Sidebar:', sidebar);

        // Exit if sidebar doesn't exist
        if (!sidebar) {
            console.error('Sidebar not found');
            return;
        }

        const header = document.querySelector('.header');
        console.log('Header:', header);

        if (!header) {
            console.error('Header not found');
            return;
        }
        
        // Get all TOC links and their parent list items
        const tocLinks = sidebar.querySelectorAll('.toc-link');
        const tocItems = sidebar.querySelectorAll('.toc-item');
        console.log('TOC Links:', tocLinks);
        console.log('TOC Items:', tocItems);
        
        // Calculate sticky position
        function updateStickyPosition() {
            // Disable sticky whenever the layout is actually stacked into a
            // single column - checking the real computed flex-direction of
            // .sidebar-main-layout (set in responsive.css at max-width: 60em)
            // instead of a hardcoded pixel value that can drift out of sync
            // with it, which is what caused the TOC to stay sticky/overlapping
            // in the 640-960px range where the layout had already stacked.
            const mainLayout = document.querySelector('.sidebar-main-layout');
            const isStacked = mainLayout &&
                window.getComputedStyle(mainLayout).flexDirection === 'column';

            if (isStacked) {
                sidebar.style.position = 'relative';
                sidebar.style.top = '';
                sidebar.style.maxHeight = '';
                sidebar.style.overflowY = '';

                // Ensure TOC is displayed above main content
                sidebar.style.order = '-1';
                return;
            }

            // Reset order for larger viewports
            sidebar.style.order = '';

            // Use --spacing-xl from the top of viewport
            const stickyTop = 32; // Matches --spacing-xl (2em at 16px base)
            
            // Apply sticky positioning
            sidebar.style.position = 'sticky';
            sidebar.style.top = stickyTop + 'px';
            sidebar.style.alignSelf = 'flex-start';

            // Adjust maxHeight calculation to avoid negative values
            const viewportHeight = window.innerHeight;
            const safeStickyTop = Math.min(stickyTop, viewportHeight - 64); // Ensure stickyTop is not too large
            sidebar.style.maxHeight = `calc(100vh - ${safeStickyTop}px - 32px)`;
            sidebar.style.overflowY = 'auto';
        }
        
        // Initialize sticky position
        updateStickyPosition();
        
        // Update on window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateStickyPosition, 250);
        });
        
        // Get sections for scroll tracking
        const sections = Array.from(tocLinks).map(link => {
            const id = link.getAttribute('href').substring(1);
            return document.getElementById(id);
        }).filter(section => section !== null);
        
        function highlightActiveSection() {
        const offset = 100; // Offset for sticky header
        let currentSection = null;

        // Use getBoundingClientRect for robust detection
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top - offset <= 0 && rect.bottom - offset > 0) {
                currentSection = section;
            }
        });

        // If at bottom, always highlight the last section
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;
        if (isAtBottom && sections.length > 0) {
            currentSection = sections[sections.length - 1];
        }

        tocLinks.forEach((link, index) => {
            const linkId = link.getAttribute('href').substring(1);
            const tocItem = tocItems[index];
            if (currentSection && linkId === currentSection.id) {
                tocItem.classList.add('active');
            } else {
                tocItem.classList.remove('active');
            }
        });
    }
        
        // Throttle scroll event for performance
        let scrollTimer;
        window.addEventListener('scroll', function() {
            if (scrollTimer) {
                window.cancelAnimationFrame(scrollTimer);
            }
            scrollTimer = window.requestAnimationFrame(highlightActiveSection);
        }, { passive: true });
        
        // Initial highlight
        highlightActiveSection();
        
        // Smooth scroll for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 24;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        function logComputedStyles() {
            const sidebar = document.getElementById('toc-sidebar');
            if (!sidebar) {
                console.error('Sidebar not found');
                return;
            }

            const computedStyles = window.getComputedStyle(sidebar);
            console.log('Computed styles for #toc-sidebar:', {
                position: computedStyles.position,
                top: computedStyles.top,
                overflow: computedStyles.overflow,
                zIndex: computedStyles.zIndex
            });

            let parent = sidebar.parentElement;
            while (parent) {
                const parentStyles = window.getComputedStyle(parent);
                console.log('Parent styles:', {
                    tagName: parent.tagName,
                    position: parentStyles.position,
                    overflow: parentStyles.overflow,
                    display: parentStyles.display
                });
                parent = parent.parentElement;
            }
        }

        // Call logComputedStyles after updating sticky position
        updateStickyPosition();
        logComputedStyles();
    }
})();