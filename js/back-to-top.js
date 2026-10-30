/* back-to-top.js - Improved Back to Top Button Functionality */

document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.getElementById('back-to-top');
    const skipLink = document.getElementById('skip-link');
    
    if (!backToTopBtn) {
        console.warn('Back to top button element not found. Make sure element with id="back-to-top" exists.');
        return;
    }
    
    // Show/hide button based on scroll position
    function toggleButtonVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const showThreshold = 300; // Show button after scrolling 300px
        
        if (scrollTop > showThreshold) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    // Reliable scroll to top function
    function scrollToTop(shouldFocusSkipLink = false) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Instant scroll for reduced motion preference
            window.scrollTo(0, 0);
            
            // Focus skip link for keyboard users
            if (shouldFocusSkipLink && skipLink) {
                setTimeout(() => skipLink.focus(), 50);
            }
        } else {
            // Always use the custom animation for consistent behavior
            smoothScrollToTop(shouldFocusSkipLink);
        }
    }
    
    // Alternative scroll function using requestAnimationFrame (more reliable)
    function smoothScrollToTop(shouldFocusSkipLink = false) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            window.scrollTo(0, 0);
            if (shouldFocusSkipLink && skipLink) {
                setTimeout(() => skipLink.focus(), 50);
            }
            return;
        }
        
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const startTime = performance.now();
        const duration = 500; // 500ms animation
        
        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const scrollTo = startPosition * (1 - easeOut);
            window.scrollTo(0, scrollTo);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                // Ensure we're exactly at the top
                window.scrollTo(0, 0);
                
                // Focus skip link if needed
                if (shouldFocusSkipLink && skipLink) {
                    setTimeout(() => skipLink.focus(), 50);
                }
            }
        }
        
        requestAnimationFrame(animateScroll);
    }
    
    // Event listeners
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Use the improved scroll method
        scrollToTop(false);
    });
    
    // Handle Enter and Space key activation
    backToTopBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            
            // Use the improved scroll method for keyboard users
            scrollToTop(true);
        }
    });
    
    // Throttled scroll event listener for performance
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(function() {
                toggleButtonVisibility();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check for button visibility
    toggleButtonVisibility();
    
    // Optional: Log for debugging (remove in production)
    if (!skipLink) {
        console.warn('Skip link not found. Back to top button will scroll to top but not focus skip link.');
    }
});