/**
 * @file media.js for the Vasuki Chess Tournament site for Yandex job application
 * @author MarwanShehata
 */

/**
 * Safely queries for a single DOM element (aka: a wrapper)
 * @param {string} selector - CSS selector string
 * @param {Document|Element} [parent=document] - Parent element to query within
 * @returns {Element|null} - The found element or null if not found
 */
function safeQuerySelector(selector, parent = document) {
  return parent ? parent.querySelector(selector) : null
}

/**
 * Safely queries for multiple DOM elements (aka: a wrapper)
 * @param {string} selector - CSS selector string
 * @param {Document|Element} [parent=document] - Parent element to query within
 * @returns {Element[]} - Array of found elements (empty if none found)
 */
function safeQuerySelectorAll(selector, parent = document) {
  return parent ? Array.from(parent.querySelectorAll(selector)) : []
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
  /** @type {number|null} */
  let timeout = null

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

;(function setupHeadingCombination() {
  /** @type {HTMLHeadingElement[]} */
  const h2Elements = safeQuerySelectorAll('.title__second')

  /**
   * Combines or separates headings based on viewport width
   * Merges first two h2 elements on desktop, separates them on mobile
   * @returns {void}
   */
  function combineHeadings() {
    if (h2Elements.length < 2) return

    /** @type {HTMLHeadingElement} */
    const firstH2 = h2Elements[0]
    /** @type {HTMLHeadingElement} */
    const secondH2 = h2Elements[1]

    // Store original content if not already stored
    if (!firstH2.dataset.originalContent) {
      firstH2.dataset.originalContent = firstH2.innerHTML
    }

    if (!secondH2.dataset.originalContent) {
      secondH2.dataset.originalContent = secondH2.innerHTML
    }

    /** @type {string} - Original content of first heading */
    const firstH2OriginalContent = firstH2.dataset.originalContent
    /** @type {string} - Original content of second heading */
    const secondH2OriginalContent = secondH2.dataset.originalContent

    if (window.innerWidth >= 768) {
      firstH2.innerHTML = firstH2OriginalContent + ' ' + secondH2OriginalContent
      secondH2.style.display = 'none'
    } else {
      firstH2.innerHTML = firstH2OriginalContent
      secondH2.innerHTML = secondH2OriginalContent
      secondH2.style.display = ''
    }
  }

  if (h2Elements.length >= 2) {
    combineHeadings()
    // prevent excessive calls
    window.addEventListener('resize', debounce(combineHeadings, 150))
  }
})()

// original code was a mess, so I rewrote it to regroup by sections
document.addEventListener('DOMContentLoaded', function () {
  // 1. Tournament section reorganization
  ;(function setupTournamentSection() {
    /** @type {Element[]} - All tournament section items */
    const tournamentItems = safeQuerySelectorAll('.tournament-section__item')
    /** @type {Element|null} - Mobile tournament block */
    const secondBlock = safeQuerySelector('.tournament-section__item.mob')

    if (tournamentItems.length >= 3 && secondBlock) {
      /** @type {Element} - Third tournament block */
      const thirdBlock = tournamentItems[2]

      if (!safeQuerySelector('.additional-wrapper', secondBlock)) {
        /** @type {HTMLDivElement} */
        const wrapper = document.createElement('div')
        wrapper.classList.add('additional-wrapper')
        wrapper.appendChild(thirdBlock)
        secondBlock.appendChild(wrapper)
      }
    }

    /** @type {Element|null} */
    const supportText = safeQuerySelector('.support-text')
    /** @type {Element|null} */
    const descriptionBlock = safeQuerySelector(
      '.tournament-section__item_description'
    )

    // Move support text to description block if elements exist and move hasn't been done
    if (
      supportText &&
      descriptionBlock &&
      !descriptionBlock.contains(supportText)
    ) {
      descriptionBlock.appendChild(supportText)
    }
  })()

  // 2. Timeline section responsive behavior
  ;(function setupTimelineSection() {
    /** @type {Element|null} */
    const timelineSection = safeQuerySelector('.timeline-section')
    if (!timelineSection) return

    /** @type {Element|null} */
    const h1Element = safeQuerySelector('.title__first', timelineSection)
    /** @type {Element|null} */
    let pElement = safeQuerySelector(
      '.timeline-section__description',
      timelineSection
    )

    if (!h1Element) return

    /** @type {string} */
    const pHTML = pElement ? pElement.outerHTML : ''

    /**
     * Updates the header structure based on viewport width
     * On desktop: moves description into h1 as span
     * On mobile: moves description back to original position
     * @returns {void}
     */
    function updateHeader() {
      /** @type {Element|null} */
      const existingSpan = safeQuerySelector(
        'span.timeline-section__description',
        h1Element
      )

      if (window.innerWidth >= 768) {
        if (!existingSpan && pElement) {
          /** @type {HTMLSpanElement} */
          const spanElement = document.createElement('span')
          spanElement.className = pElement.className
          spanElement.innerHTML = pElement.innerHTML

          h1Element.appendChild(spanElement)

          if (pElement.parentNode) {
            pElement.parentNode.removeChild(pElement)
            pElement = null
          }
        }
      } else {
        if (
          !safeQuerySelector(
            '.timeline-section__description',
            timelineSection
          ) &&
          existingSpan
        ) {
          existingSpan.parentNode.removeChild(existingSpan)

          /** @type {HTMLDivElement} */
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = pHTML
          pElement = tempDiv.firstChild

          h1Element.parentNode.insertBefore(pElement, h1Element.nextSibling)
        }
      }
    }

    updateHeader()
    window.addEventListener('resize', debounce(updateHeader, 150))
  })()

  // 3. Timeline slider transformations
  ;(function setupTimelineSlider() {
    /** @type {Element|null} */
    const timelineSection = safeQuerySelector('.timeline-section')
    if (!timelineSection) return

    /** @type {Element|null} */
    const sliderContainer = safeQuerySelector(
      '.slider__container',
      timelineSection
    )
    if (!sliderContainer) return

    /** @type {Element[]} */
    const sliderItems = safeQuerySelectorAll('.slider__item', sliderContainer)

    /** @type {string} - Original HTML structure of slider */
    const originalSliderHTML = sliderItems
      .map((item) => item.outerHTML)
      .join('')

    /** @type {boolean} - Flag to track if slider is in transformed state */
    let transformed = false

    /**
     * Transforms slider between desktop (combined) and mobile (separate) views
     * - Desktop: Combines all timeline lists into one slider item
     * - Mobile: Restores original structure with separate slider items
     * TODO - NOT WORKING
     * @returns {void}
     */
    function transformSlider() {
      if (window.innerWidth >= 768 && !transformed) {
        transformed = true

        /** @type {Element[]} */
        const allLists = safeQuerySelectorAll(
          '.timeline__list',
          sliderContainer
        )

        if (allLists.length === 0) return

        /** @type {HTMLElement} */
        const newSliderItem = document.createElement('article')
        newSliderItem.classList.add('slider__item')

        /** @type {HTMLDivElement} */
        const wrapper = document.createElement('div')
        wrapper.classList.add('combined-wrapper')

        /** @type {number|null} - Timeout ID for resize debouncing */
        let resizeTimeout = null
        /** @type {boolean} - Track if currently in resize state */
        let isResizing = false

        /**
         * Animate the grid that has instant-transform=true during resize
         * and defaults back to false when resize stops
         */
        wrapper.setAttribute('instant-transform', 'false')

        const handleResize = () => {
          console.log(`resizing element ${wrapper.className}`)
          if (!isResizing) {
            isResizing = true
            wrapper.setAttribute('instant-transform', 'true')
          }

          // Clear existing timeout to reset the timer
          if (resizeTimeout) {
            clearTimeout(resizeTimeout)
          }

          // Set new timeout to disable instant transforms after resize stops
          resizeTimeout = setTimeout(() => {
            isResizing = false
            wrapper.setAttribute('instant-transform', 'false')
          }, 200) // Reduced timeout for faster response
        }

        // Use the existing debounced resize handler instead of adding another listener
        // This prevents multiple resize listeners from being attached
        const debouncedHandleResize = debounce(handleResize, 16) // ~60fps
        window.addEventListener('resize', debouncedHandleResize)
        /** End of animate on resize */

        /* Clone each list to avoid DOM manipulation issues
     If you move the original elements, they disappear 
     from their original places, which can break the layout
     or make it hard to restore the original structure when switching back to mobile view. */
        allLists.forEach((list, index) => {
          const cloned = list.cloneNode(true)
          cloned.classList.add(`timeline__list-${index + 1}`)
          wrapper.appendChild(cloned)
        })

        newSliderItem.appendChild(wrapper)

        sliderContainer.innerHTML = ''
        sliderContainer.appendChild(newSliderItem)

        /** @type {Element|null} */
        const sliderController = safeQuerySelector(
          '.slider-controller',
          timelineSection
        )
        if (sliderController) {
          sliderController.style.display = 'none'
        }
      } else if (window.innerWidth < 768 && transformed) {
        transformed = false

        sliderContainer.innerHTML = originalSliderHTML

        /** @type {Element|null} */
        const sliderController = safeQuerySelector(
          '.slider-controller',
          timelineSection
        )
        if (sliderController) {
          sliderController.style.display = ''
        }
      }
    }

    transformSlider()

    window.addEventListener('resize', debounce(transformSlider, 150))
  })()

  // 4. Carousel controller rearrangement
  ;(function setupCarouselController() {
    /** @type {Element|null} */
    const participantsSection = safeQuerySelector('.participants')
    if (!participantsSection) return

    /** @type {Element|null} */
    const container = safeQuerySelector('.container', participantsSection)
    if (!container) return

    /**
     * Rearranges carousel controller and title based on viewport width
     * - Desktop: Places title and controller in a wrapper div
     * - Mobile: Returns title and controller to original positions
     * @returns {void}
     */
    function rearrangeCarouselController() {
      /** @type {Element|null} */
      const title = safeQuerySelector('.title__first', container)
      /** @type {Element|null} */
      const carouselController = safeQuerySelector(
        '.carousel-controller',
        container
      )

      if (!title || !carouselController) return

      if (window.innerWidth >= 768) {
        /** @type {Element|null} */
        let wrapper = safeQuerySelector('.wrapper', container)

        if (!wrapper) {
          /** @type {HTMLDivElement} */
          wrapper = document.createElement('div')
          wrapper.classList.add('wrapper')

          // Clone nodes again
          /** @type {Element} */
          const titleClone = title.cloneNode(true)
          /** @type {Element} */
          const controllerClone = carouselController.cloneNode(true)

          wrapper.appendChild(titleClone)
          wrapper.appendChild(controllerClone)

          // Insert at the beginning of container
          if (container.firstChild) {
            container.insertBefore(wrapper, container.firstChild)
          } else {
            container.appendChild(wrapper)
          }

          // Remove original elements after cloning
          if (title.parentNode) title.parentNode.removeChild(title)
          if (carouselController.parentNode)
            carouselController.parentNode.removeChild(carouselController)
        }
      } else {
        /** @type {Element|null} */
        const wrapper = safeQuerySelector('.wrapper', container)

        if (wrapper) {
          /** @type {Element|null} */
          const wrapperTitle = safeQuerySelector('.title__first', wrapper)
          /** @type {Element|null} */
          const wrapperController = safeQuerySelector(
            '.carousel-controller',
            wrapper
          )

          // Move elements out of wrapper
          if (wrapperTitle) {
            /** @type {Element} */
            const titleClone = wrapperTitle.cloneNode(true)
            container.insertBefore(titleClone, wrapper)
          }

          if (wrapperController) {
            /** @type {Element} */
            const controllerClone = wrapperController.cloneNode(true)
            container.insertBefore(controllerClone, wrapper)
          }

          // Remove wrapper
          container.removeChild(wrapper)
        }
      }
    }

    rearrangeCarouselController()
    window.addEventListener(
      'resize',
      debounce(rearrangeCarouselController, 150)
    )
  })()
})
