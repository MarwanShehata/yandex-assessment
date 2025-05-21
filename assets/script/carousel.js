/**
 * @file carousel.js for the Vasuki Chess Tournament site for Yandex job application
 * @author MarwanShehata
 */

;(() => {
  /** @type {HTMLDivElement} */
  const carouselContainer = document.querySelector('.carousel__container')

  /** @type {HTMLButtonElement} */
  const prevButton = document.querySelector('.btn__carousel-prev')

  /** @type {HTMLButtonElement} */
  const nextButton = document.querySelector('.btn__carousel-next')

  /** @type {HTMLDivElement} */
  const countIndicator = document.querySelector('.count-indicator')

  /** @type {HTMLElement[]} */
  const items = Array.from(document.querySelectorAll('.carousel__item'))

  /** @type {number} */
  let currentIndex = 0

  /** @type {number|null} */
  let autoSlideInterval = null
  /** @constant {number} */
  const AUTO_SLIDE_DELAY = 5000

  // Guard clause or early exit
  if (!items.length || !carouselContainer.parentElement) {
    console.warn('Carousel initialization failed: required elements not found')
    return
  }

  /**
   * Determines how many items should appear per slide based on viewport width
   * @returns {number} Number of items to show per slide
   */
  function getItemsPerSlide() {
    return window.innerWidth >= 768 ? 3 : 1
  }

  /**
   * Calculates gap size from computed styles with proper fallback
   * @returns {number} Gap size in pixels
   */
  function getGapSize() {
    const style = window.getComputedStyle(carouselContainer)
    return parseFloat(style.gap || style.columnGap) || 0
  }

  /**
   * Calculates the maximum valid index based on current layout
   * @returns {{
   * itemsPerSlide: number,
   * totalItems: number,
   * maxIndex: number,
   * itemWidth: number,
   * gapSize: number,
   * slideWidth: number,
   * totalWidth: number,
   * maxOffset: number
   * }}
   */
  function calculateCarouselMetrics() {
    const itemsPerSlide = getItemsPerSlide()
    const totalItems = items.length

    const totalItemsToScroll = Math.max(0, totalItems - itemsPerSlide)
    const maxIndex = Math.max(0, Math.ceil(totalItemsToScroll / itemsPerSlide))
    const itemWidth = items[0].offsetWidth
    const gapSize = getGapSize()

    // Calculate dimensions once
    const slideWidth = itemWidth * itemsPerSlide + gapSize * (itemsPerSlide - 1)
    const totalWidth = itemWidth * totalItems + gapSize * (totalItems - 1)
    const maxOffset = Math.max(0, totalWidth - slideWidth)

    return {
      itemsPerSlide,
      totalItems,
      maxIndex,
      itemWidth,
      gapSize,
      slideWidth,
      totalWidth,
      maxOffset,
    }
  }

  /**
   * Updates carousel position and UI indicators
   */
  function updateCarousel() {
    const metrics = calculateCarouselMetrics()
    // Ensure currentIndex is within bounds
    currentIndex = Math.max(0, Math.min(currentIndex, metrics.maxIndex))

    /** @type {number} */
    const desiredOffset =
      currentIndex *
      (metrics.itemWidth * metrics.itemsPerSlide +
        metrics.gapSize * metrics.itemsPerSlide)
    const offset = -Math.min(desiredOffset, metrics.maxOffset)

    carouselContainer.style.transform = `translateX(${offset}px)`

    /** @type {number} */
    const displayedStart = currentIndex * metrics.itemsPerSlide + 1

    /** @type {number} */
    const displayedEnd = Math.min(
      displayedStart + metrics.itemsPerSlide - 1,
      metrics.totalItems
    )

    countIndicator.innerHTML = `<span class="slides-numbers">${displayedEnd} <span class="total-count">/ ${metrics.totalItems}</span></span>`

    prevButton.disabled = currentIndex === 0
    nextButton.disabled = currentIndex >= metrics.maxIndex
  }

  /**
   * Handles slide navigation in the specified direction
   * @param {number} direction - Direction to move (-1 for prev, 1 for next)
   */
  function navigateSlide(direction) {
    const metrics = calculateCarouselMetrics()

    if (direction < 0 && currentIndex > 0) {
      currentIndex--
      updateCarousel()
    } else if (direction > 0 && currentIndex < metrics.maxIndex) {
      currentIndex++
      updateCarousel()
    }
  }

  /**
   * Resets and starts the auto-slide timer
   */
  function startAutoSlide() {
    // Clear any existing interval to prevent multiple intervals
    stopAutoSlide()

    autoSlideInterval = setInterval(() => {
      const metrics = calculateCarouselMetrics()

      // Auto-cycle logic
      if (currentIndex < metrics.maxIndex) {
        currentIndex++
      } else {
        currentIndex = 0
      }

      updateCarousel()
    }, AUTO_SLIDE_DELAY)
  }

  /**
   * Stops the auto-slide timer
   */
  function stopAutoSlide() {
    if (autoSlideInterval !== null) {
      clearInterval(autoSlideInterval)
      autoSlideInterval = null
    }
  }

  prevButton.addEventListener('click', () => navigateSlide(-1))
  nextButton.addEventListener('click', () => navigateSlide(1))

  // Pause on hover
  carouselContainer.addEventListener('mouseenter', stopAutoSlide)
  carouselContainer.addEventListener('mouseleave', startAutoSlide)

  // performance on resize for development purposes
  let resizeTimer = null
  window.addEventListener('resize', () => {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer)
    }

    resizeTimer = setTimeout(() => {
      currentIndex = 0
      updateCarousel()
      resizeTimer = null
    }, 150)
  })

  updateCarousel()
  startAutoSlide()
})()
