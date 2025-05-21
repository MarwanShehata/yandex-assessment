/**
 * @file slider.js for the Vasuki Chess Tournament site for Yandex job application
 * @author MarwanShehata
 */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * @type {{
   *  sliderInitialized: boolean,
   *  currentIndex: number,
   *  resizeTimer: number|null
   * }}
   */
  const state = {
    sliderInitialized: false,
    currentIndex: 0,
    resizeTimer: null,
  }

  /**
   * @type {{
   *  slider: string,
   *  sliderContainer: string,
   *  sliderItems: string,
   *  prevButton: string,
   *  nextButton: string,
   *  indicatorContainer: string,
   *  feed: string,
   *  feedContent: string
   * }}
   */
  const selectors = {
    slider: '.slider',
    sliderContainer: '.slider__container',
    sliderItems: '.slider__item',
    prevButton: '.btn__prev',
    nextButton: '.btn__next',
    indicatorContainer: '.indicator',

    /** added **/
    feed: '.feed',
    feedContent: '.feed__content',
  }

  /**
   * @type {Object.<string, Element|NodeList|null>}
   */
  const elements = {}

  /**
   * Safely get DOM element, caching for future use
   * @param {string} selector - The CSS selector
   * @returns {Element|null} - The DOM element or null if not found
   */
  const getElement = (selector) => {
    if (!elements[selector]) {
      elements[selector] = document.querySelector(selector)
    }
    return elements[selector]
  }

  /**
   * Safely get multiple DOM elements, caching for future use
   * @param {string} selector - The CSS selector
   * @returns {NodeList|[]} - The DOM elements or empty array if not found
   */
  const getElements = (selector) => {
    const key = `${selector}_list`
    if (!elements[key]) {
      elements[key] = document.querySelectorAll(selector)
    }
    return elements[key]
  }

  /**
   * Update the slider position
   * @returns {void}
   */
  const updateSliderPosition = () => {
    /** @type {HTMLElement} */
    const slider = getElement(selectors.slider)
    /** @type {HTMLElement} */
    const sliderContainer = getElement(selectors.sliderContainer)
    console.log(sliderContainer)
    if (slider && sliderContainer) {
      const slideWidth = slider.offsetWidth
      sliderContainer.style.transform = `translateX(-${
        state.currentIndex * slideWidth
      }px)`
    }
  }

  /**
   * Update slide widths based on container size
   * @returns {void}
   */
  const updateSlideWidths = () => {
    /** @type {HTMLElement} */
    const slider = getElement(selectors.slider)
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)

    if (slider && slides && slides.length) {
      const slideWidth = slider.offsetWidth
      slides.forEach((slide) => {
        slide.style.minWidth = `${slideWidth}px`
      })
      updateSliderPosition()
    }
  }

  /**
   * Update the indicator dots to reflect current slide
   * @returns {void}
   */
  const updateIndicator = () => {
    /** @type {NodeListOf<HTMLElement>} */
    const dots = getElements('.indicator .dot')
    if (dots && dots.length) {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentIndex)
      })
    }
  }

  /**
   * Update the prev/next buttons state based on current position
   * @returns {void}
   */
  const updateButtons = () => {
    /** @type {HTMLButtonElement} */
    const prevButton = getElement(selectors.prevButton)
    /** @type {HTMLButtonElement} */
    const nextButton = getElement(selectors.nextButton)
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)

    if (prevButton && nextButton && slides && slides.length) {
      prevButton.disabled = state.currentIndex === 0
      nextButton.disabled = state.currentIndex === slides.length - 1
    }
  }

  /**
   * Navigate to a specific slide
   * @param {number} index - The slide index to navigate to
   * @returns {void}
   */
  const goToSlide = (index) => {
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)
    if (slides && slides.length) {
      const maxIndex = slides.length - 1
      // Ensure index is within bounds
      state.currentIndex = Math.max(0, Math.min(index, maxIndex))

      updateSliderPosition()
      updateIndicator()
      updateButtons()
    }
  }

  /**
   * Creates the indicator dots for navigation
   * @returns {void}
   */
  const createIndicators = () => {
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)
    /** @type {HTMLElement} */
    const indicatorContainer = getElement(selectors.indicatorContainer)

    if (
      slides &&
      indicatorContainer &&
      indicatorContainer.children.length === 0
    ) {
      indicatorContainer.innerHTML = ''

      slides.forEach((_, index) => {
        const dot = document.createElement('div')
        dot.classList.add('dot')
        if (index === state.currentIndex) {
          dot.classList.add('active')
        }

        // Use event delegation instead of attaching listeners to each dot
        dot.dataset.index = index.toString()
        indicatorContainer.appendChild(dot)
      })

      // Single event listener for all dots using event delegation
      indicatorContainer.addEventListener(
        'click',
        (/** @type {MouseEvent} */ e) => {
          const target = /** @type {HTMLElement} */ (e.target)
          if (target && target.classList.contains('dot')) {
            const index = parseInt(target.dataset.index || '-1', 10)
            if (!isNaN(index) && index >= 0) {
              goToSlide(index)
            }
          }
        }
      )
    }
  }

  /**
   * Setup navigation button handlers
   * @returns {void}
   */
  const setupButtonHandlers = () => {
    /** @type {HTMLButtonElement} */
    const prevButton = getElement(selectors.prevButton)
    /** @type {HTMLButtonElement} */
    const nextButton = getElement(selectors.nextButton)

    if (prevButton && nextButton) {
      // Remove old handlers first to prevent duplicates
      const newPrevButton = /** @type {HTMLButtonElement} */ (
        prevButton.cloneNode(true)
      )
      const newNextButton = /** @type {HTMLButtonElement} */ (
        nextButton.cloneNode(true)
      )

      if (prevButton.parentNode) {
        prevButton.parentNode.replaceChild(newPrevButton, prevButton)
      }
      if (nextButton.parentNode) {
        nextButton.parentNode.replaceChild(newNextButton, nextButton)
      }

      // Update cached elements
      elements[selectors.prevButton] = newPrevButton
      elements[selectors.nextButton] = newNextButton

      // Add new handlers
      newPrevButton.addEventListener('click', () => {
        if (state.currentIndex > 0) {
          goToSlide(state.currentIndex - 1)
        }
      })

      newNextButton.addEventListener('click', () => {
        /** @type {NodeListOf<HTMLElement>} */
        const slides = getElements(selectors.sliderItems)

        if (!slides || !slides.length) {
          console.warn('Slider items not found when handling next button click')
          return
        }

        if (state.currentIndex < slides.length - 1) {
          goToSlide(state.currentIndex + 1)
        }
      })
    }
  }

  /**
   * Initialize the slider for mobile view
   * @returns {void}
   */
  const initializeSlider = () => {
    /** @type {HTMLElement} */
    const sliderContainer = getElement(selectors.sliderContainer)
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)

    if (!sliderContainer) {
      console.warn('Slider container not found during initialization')
      return
    }

    if (!slides || !slides.length) {
      console.warn('No slider items found during initialization')
      return
    }

    if (window.innerWidth < 768) {
      if (!state.sliderInitialized) {
        state.sliderInitialized = true
        state.currentIndex = 0 // Reset to first slide when initializing

        // Setup slider container
        sliderContainer.style.display = 'flex'
        sliderContainer.style.transition = 'transform 0.5s ease-in-out'

        // Create indicator dots
        createIndicators()

        // Setup button handlers
        setupButtonHandlers()

        // Setup resize handler with debounce
        window.addEventListener('resize', debounceResize)

        // Initialize slide widths and controls
        updateSlideWidths()
        updateIndicator()
        updateButtons()
      }
    } else if (state.sliderInitialized) {
      // Reset slider for desktop view
      cleanupSlider()
    }
  }

  /**
   * Clean up the slider when switching to desktop view
   * @returns {void}
   */
  const cleanupSlider = () => {
    state.sliderInitialized = false

    /** @type {HTMLElement} */
    const sliderContainer = getElement(selectors.sliderContainer)
    /** @type {NodeListOf<HTMLElement>} */
    const slides = getElements(selectors.sliderItems)
    /** @type {HTMLElement} */
    const indicatorContainer = getElement(selectors.indicatorContainer)

    if (sliderContainer) {
      sliderContainer.style.display = ''
      sliderContainer.style.transition = ''
      sliderContainer.style.transform = ''
    }

    if (slides && slides.length) {
      slides.forEach((slide) => {
        slide.style.minWidth = ''
      })
    }

    if (indicatorContainer) {
      // Reset indicators
      indicatorContainer.innerHTML = ''
    }

    // Clean up button event listeners
    setupButtonHandlers()

    // Remove the resize event listener
    window.removeEventListener('resize', debounceResize)
  }

  /**
   * Debounce the resize event to prevent excessive calculations
   */
  const debounceResize = () => {
    if (state.resizeTimer) {
      clearTimeout(state.resizeTimer)
    }

    state.resizeTimer = setTimeout(() => {
      if (state.sliderInitialized) {
        updateSlideWidths()
      }
      initializeSlider()
    }, 150)
  }

  initializeSlider()
  window.addEventListener('resize', debounceResize)
})
