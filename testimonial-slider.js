document.addEventListener('DOMContentLoaded', () => {
  const logoList = document.querySelector('.testimonial-logo_cl');
  const logoItems = document.querySelectorAll('.testimonial-logo_ci');
  const testimonialItems = document.querySelectorAll('.testimonial_item_ci');
  const btnUp = document.querySelector('[testimonial-button="up"]');
  const btnDown = document.querySelector('[testimonial-button="down"]');

  if (!logoList || logoItems.length === 0) return;

  // Responsive settings
  const isMobile = window.innerWidth <= 991;
  let currentIndex = isMobile ? 0 : 2;
  const startingIndex = isMobile ? 0 : 2;
  const stepSize = isMobile ? 12 : 6;
  
  const totalItems = logoItems.length;
  let selectionTimeout;

  function updateSlider(index, skipTransform = false) {
    // Bound check
    if (index < 0) index = 0;
    if (index >= totalItems) index = totalItems - 1;
    currentIndex = index;

    // 1. Immediately remove classes to allow for fade-out transition
    logoItems.forEach(item => item.classList.remove('testimonial-logo_ci__selected'));
    testimonialItems.forEach(item => item.classList.remove('testimonial_item_ci__selected'));

    // 2. Apply logo selection immediately
    const activeLogo = logoItems[currentIndex];
    activeLogo.classList.add('testimonial-logo_ci__selected');
    const testimonialId = activeLogo.getAttribute('testimonial-button');

    const applyTestimonialSelection = () => {
      testimonialItems.forEach((item) => {
        const isMatch = item.getAttribute('testimonial') === testimonialId;
        if (isMatch) item.classList.add('testimonial_item_ci__selected');
      });
    };

    if (!skipTransform) {
      // 3. Transform the logo list
      // Calculate offset relative to the starting position
      const offset = (currentIndex - startingIndex) * stepSize;
      
      const x = isMobile ? -offset : 0;
      const y = isMobile ? 0 : -offset;

      logoList.style.transition = 'transform 0.5s ease';
      logoList.style.transform = `translate3d(${x}rem, ${y}rem, 0px)`;

      // 4. Delay testimonial selection to match the 1000ms opacity transition
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(applyTestimonialSelection, 1000);
    } else {
      // If skipping transform (initialization), apply immediately
      applyTestimonialSelection();
    }
  }

  // Event Listeners for Arrows
  btnUp?.addEventListener('click', () => {
    if (currentIndex > 0) updateSlider(currentIndex - 1);
  });

  btnDown?.addEventListener('click', () => {
    if (currentIndex < totalItems - 1) updateSlider(currentIndex + 1);
  });

  // Optional: Click logo to select
  logoItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      updateSlider(index);
    });
  });

  // Initialize
  updateSlider(currentIndex, true);
});