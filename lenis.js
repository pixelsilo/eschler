// Wait for Lenis library to load, then initialize
function initLenis() {
  if (typeof Lenis === 'undefined') {
    // Lenis not loaded yet, retry after a short delay
    requestAnimationFrame(initLenis);
    return;
  }

  // Initialize Lenis
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  // Expose to window for debugging
  window.lenis = lenis;

  // Update Lenis on each animation frame
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Update scroll bounds once after DOM is ready
  lenis.resize();
}

// Start initialization
initLenis();