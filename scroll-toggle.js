document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('[toggle="scrolled"]');
  const snapSections = document.querySelectorAll('[data-snap-section]');
  
  let userIntent = 1; 
  let isInteracting = false;
  let interactTimeout;

  // Track when the user's hand is actively driving the scroll
  function handleInteraction(deltaY) {
    userIntent = Math.sign(deltaY);
    isInteracting = true;

    clearTimeout(interactTimeout);
    // 150ms after the last input, we declare the user has let go 
    // (meaning momentum or Lenis Snap is now in control)
    interactTimeout = setTimeout(() => {
      isInteracting = false;
    }, 150); 
  }

  // Mouse wheel intent
  window.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) handleInteraction(e.deltaY);
  }, { passive: true });

  // Touch swipe intent
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const touchEndY = e.changedTouches[0].screenY;
    const deltaY = touchStartY - touchEndY; 
    if (Math.abs(deltaY) > 5) {
      handleInteraction(deltaY);
      touchStartY = touchEndY; 
    }
  }, { passive: true });

  function toggleScrolledClass() {
    const currentScrollPos = window.scrollY;

    // Safety catch: ALWAYS show the navbar at the very top of the page
    if (currentScrollPos <= 50) {
      elements.forEach(el => el.classList.remove("scrolled"));
      return;
    }

    if (isInteracting) {
      // 1. User is actively holding/scrolling
      if (userIntent === 1) {
        elements.forEach(el => el.classList.add("scrolled")); // Hides
      } else if (userIntent === -1) {
        elements.forEach(el => el.classList.remove("scrolled")); // Shows
      }
    } else {
      // 2. User let go. The page is moving on its own (momentum or Snap).
      // Check if we are gliding into a snap point to apply the class early.
      let isSnappingIntoPlace = false;
      
      snapSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // If the top of the snap section is within 250px of the viewport top,
        // the snap plugin is actively pulling us in.
        if (Math.abs(rect.top) < 250) {
          isSnappingIntoPlace = true;
        }
      });

      // Instantly hide the navbar as it approaches the final snap destination, killing the flicker
      if (isSnappingIntoPlace) {
        elements.forEach(el => el.classList.add("scrolled"));
      }
    }
  }

  window.addEventListener("scroll", toggleScrolledClass, { passive: true });
});