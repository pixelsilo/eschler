  document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('[slider="section"]');
    if (!sliders.length) return;

    // Cache the root font size once for REM conversions - test 3
    const htmlFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    // Optimized helper function
    const getAttr = (el, attr, fallback, isGapOrOffset = false) => {
      const val = el.getAttribute(attr);
      if (!val) return fallback;
      const num = parseFloat(val);
      return (isGapOrOffset && val.toLowerCase().includes('rem')) ? num * htmlFontSize : num;
    };

    sliders.forEach(sliderSection => {
      const sliderWrapper = sliderSection.querySelector('[slider="wrapper"]'); 
      const btnPrev = sliderSection.querySelector('[slider="prev"]');
      const btnNext = sliderSection.querySelector('[slider="next"]');

      if (!sliderWrapper) return; 

      // Support for Webflow CMS .w-dyn-list wrappers
      const swiperContainer = sliderWrapper.parentNode;
      swiperContainer.classList.add('swiper');
      sliderWrapper.classList.add('swiper-wrapper');
      
      // Select items dynamically from the wrapper to ensure we target the right elements
      sliderWrapper.querySelectorAll('[slider="item"]').forEach(item => item.classList.add('swiper-slide'));

      // 1. Read layout attributes (Items in view)
      const itemsDesk = getAttr(sliderSection, 'slider-items', 2.5);
      const itemsTab = getAttr(sliderSection, 'slider-items-tab', 2.5);
      const itemsMob = getAttr(sliderSection, 'slider-items-mob', 1.5);

      // 2. Read layout attributes (Gaps - requires conversion)
      const gapDesk = getAttr(sliderSection, 'slider-gap', 64, true);
      const gapTab = getAttr(sliderSection, 'slider-gap-tab', 64, true);
      const gapMob = getAttr(sliderSection, 'slider-gap-mob', 32, true);

      // 3. Read layout attributes (Offsets - requires conversion)
      const offsetDesk = getAttr(sliderSection, 'slider-offset', 32, true);
      const offsetTab = getAttr(sliderSection, 'slider-offset-tab', 32, true);
      const offsetMob = getAttr(sliderSection, 'slider-offset-mob', 16, true);

      // 4. Read behavior attributes
      const duration = getAttr(sliderSection, 'slider-duration', 300);
      const isCentered = sliderSection.getAttribute('slider-centered') === 'true';
      sliderWrapper.style.transitionTimingFunction = sliderSection.getAttribute('slider-easing') || 'ease';

      // Handle pips if enabled
      const hasPips = sliderSection.getAttribute('slider-pips') === 'true';
      let pipContainer = null;
      let pips = [];

      if (hasPips) {
        const pipTemplate = sliderSection.querySelector('[slider="pip"]');
        if (pipTemplate) {
          pipContainer = pipTemplate.parentNode;
          const slides = sliderWrapper.querySelectorAll('[slider="item"]');
          const slideCount = slides.length;

          // Remove the template pip
          pipTemplate.remove();

          // Create pips for each slide
          slides.forEach((slide, index) => {
            const pip = pipTemplate.cloneNode(true);
            pip.removeAttribute('slider-pip-template');
            if (index === 0) pip.classList.add('selected');
            pipContainer.appendChild(pip);
            pips.push(pip);
          });
        }
      }

      // Initialize Swiper
      const swiper = new Swiper(swiperContainer, {
        speed: duration,
        centeredSlides: isCentered,
        loop: isCentered,
        loopAdditionalSlides: isCentered ? 4 : 0, 
        loopPreventsSliding: false,
        
        // Loop & Clone Stabilization
        initialSlide: 0,
        watchSlidesProgress: true,
        roundLengths: true,
        observer: true,
        observeParents: true,
        
        slideActiveClass: isCentered ? 'focused' : 'swiper-slide-active',
        
        // Base Mobile Settings
        slidesPerView: itemsMob, 
        spaceBetween: gapMob,
        slidesOffsetBefore: isCentered ? 0 : offsetMob, 
        slidesOffsetAfter: isCentered ? 0 : offsetMob,

        navigation: {
          nextEl: btnNext,
          prevEl: btnPrev,
          disabledClass: 'end', 
        },

        breakpoints: {
          768: {
            slidesPerView: itemsTab,
            spaceBetween: gapTab,
            slidesOffsetBefore: isCentered ? 0 : offsetTab,
            slidesOffsetAfter: isCentered ? 0 : offsetTab,
          },
          992: { 
            slidesPerView: itemsDesk,
            spaceBetween: gapDesk,
            slidesOffsetBefore: isCentered ? 0 : offsetDesk,
            slidesOffsetAfter: isCentered ? 0 : offsetDesk,
          }
        },
        
        // THE FIX: Force an immediate layout recalculation upon initialization
        // This ensures clones are perfectly rendered to the left of Slide 1
        on: {
          init: function () {
            if (isCentered) {
              this.update(); 
            }
          },
          slideChange: function () {
            if (hasPips && pips.length > 0) {
              // Update pip selection
              const activeIndex = this.realIndex % pips.length;
              pips.forEach((pip, index) => {
                pip.classList.toggle('selected', index === activeIndex);
              });
            }
          }
        }
      });

      // Handle auto-scroll if enabled
      let pauseAutoScroll = () => {}; // Default no-op function
      const autoScrollAttr = sliderSection.getAttribute('slider-auto');
      if (autoScrollAttr) {
        const scrollDelay = parseInt(autoScrollAttr);
        if (!isNaN(scrollDelay)) {
          let autoScrollTimer = null;
          let pauseTimer = null;

          const startAutoScroll = () => {
            if (autoScrollTimer) return;
            autoScrollTimer = setInterval(() => {
              swiper.slideNext();
            }, scrollDelay);
          };

          const stopAutoScroll = () => {
            if (autoScrollTimer) {
              clearInterval(autoScrollTimer);
              autoScrollTimer = null;
            }
          };

          pauseAutoScroll = () => {
            stopAutoScroll();
            if (pauseTimer) clearTimeout(pauseTimer);
            pauseTimer = setTimeout(() => {
              startAutoScroll();
            }, 60000); // 60 second pause
          };

          // Pause on user interaction
          const interactionHandler = () => {
            pauseAutoScroll();
          };

          // Listen for navigation button clicks
          if (btnNext) btnNext.addEventListener('click', interactionHandler);
          if (btnPrev) btnPrev.addEventListener('click', interactionHandler);

          // Listen for swiper interactions
          swiperContainer.addEventListener('touchstart', interactionHandler);
          swiperContainer.addEventListener('mousedown', interactionHandler);
          swiperContainer.addEventListener('wheel', interactionHandler);

          // Start auto-scroll immediately
          startAutoScroll();
        }
      }

      // Make pips clickable
      if (hasPips && pips.length > 0) {
        pips.forEach((pip, index) => {
          pip.style.cursor = 'pointer';
          pip.addEventListener('click', () => {
            swiper.slideToLoop(index);
            pauseAutoScroll();
          });
        });
      }
    });
  });