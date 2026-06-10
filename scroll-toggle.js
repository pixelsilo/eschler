  document.addEventListener("DOMContentLoaded", function() {
    // Select the elements with toggle="scrolled" attribute
    const elements = document.querySelectorAll('[toggle="scrolled"]');
    
    // Track the previous scroll position to detect scroll direction
    let lastScrollPos = 0;

    function toggleScrolledClass() {
      const currentScrollPos = window.scrollY;

      if (currentScrollPos > lastScrollPos) {
        // Scrolling down
        elements.forEach(el => el.classList.add("scrolled"));
      } else if (currentScrollPos < lastScrollPos) {
        // Scrolling up
        elements.forEach(el => el.classList.remove("scrolled"));
      }

      lastScrollPos = currentScrollPos;
    }

    // Listen for scroll
    window.addEventListener("scroll", toggleScrolledClass, { passive: true });
  });