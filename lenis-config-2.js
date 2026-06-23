// 1. Detect touch devices (Chrome DevTools mobile emulation sets maxTouchPoints)
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// 2. Initialize Lenis (autoResize is true by default)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    syncTouch: !isTouchDevice, // Only manage touch inertia on non-touch (desktop) devices
    ...(isTouchDevice ? {} : { touchMultiplier: 0.1 }), // Only apply touchMultiplier on desktop
});

// 3. Initialize the Snap plugin
const snap = new Snap(lenis, {
    type: 'proximity',
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    distanceThreshold: isTouchDevice ? '15%' : '50%', // Tighter snap zone on touch devices
});

// 4. Add Snap Elements
const snapSections = document.querySelectorAll('[data-snap-section]');
snap.addElements(snapSections, {
    align: 'start',
});

// 4. Hook Lenis into GSAP ScrollTrigger (Crucial since you are using GSAP)
if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0, 0);
} else {
    // 5. Fallback RAF loop if GSAP isn't loaded on this specific page
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// 6. Handle dynamic height changes
// This ensures Lenis recalculates the page length when content (like forms) expands or toggles
if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
        lenis.resize();
    });
    resizeObserver.observe(document.body);
}