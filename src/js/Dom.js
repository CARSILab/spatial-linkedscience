import $ from 'jquery'
import { resetMap } from './Plot.js'

// DOM CACHING
const $results = $('.results')
const $resultsContainer = $('.results-container')
const $containers = $('.papers, .people')
const $title = $('.results-title')
const $peopleHeader = $('.people-header')
const $paperHeader = $('.papers-header')
const $peopleList = $('.people-list')
const $paperList = $('.papers-list')
const $mainSearch = $('#main-search')
const $navSearch = $('#nav-search')
const $navInputGroup = $('#navInputGroup')
const $conference = $('#dropdown-selection')
const $belt = $('.belt')
const $spinner = $('.icon-spinner')

// Clears all data from the page and resets the map
function clear () {
  $mainSearch.val('')
  $navSearch.val('')
  $conference.text('Conference')
  $conference.attr('data-value', 'null')
  resetMap()
}

function clearLists () {
  $peopleList.empty()
  $paperList.empty()
}

// Switches between the landing page and the results page by sliding the 'conveyor belt' across the viewport
// then calls clear()
function slide (direction) {
  if (direction === 'left') {
    $belt.css('left', '0%')
    window.location.hash = ''
  } else if (direction === 'right') {
    $belt.css('left', '-100%')
    $navSearch.blur()
  }
  clear()
}

// Clicking the logo in the navbar will bring you to the landing page
function initBrand () {
  $('.navbar-brand').on('click', function () {
    slide('left')
  })
}

function initNavInput () {
  $navInputGroup.on('click', expand)
  $navSearch.on('focus', expand)
  $navSearch.on('blur', collapse)

  function expand () {
    $navInputGroup.removeClass('isCollapsed')
    if (!$navSearch.is(':focus')) {
      $navSearch.focus()
    }
  }

  function collapse () {
    $navInputGroup.addClass('isCollapsed')
  }
}

//
function initSearch () {
  $('#main-form, #nav-form').on('submit', function (event) {
    event.preventDefault()

    // Hide the navSearch bar by default
    const selector = `#${$(event.currentTarget).attr('id').replace('form', 'search')}`
    const key = encodeURIComponent($(selector).val())
    const conf = $('#dropdown-selection').attr('data-value')

    if (key.length > 1) {
      window.location.hash = `search?${$.param({key, conf})}`
    }
  })
}

// Clicking a dropdown item will show the selection text in the button and pass it to the form once it is submitted
function initDropdown () {
  $('.dropdown-toggle').on('click', onDropdownToggle)
  $('.dropdown-item').on('click', onDropdownItem)

  function onDropdownToggle (event) {
    const $target = $(event.target)
    $target.closest('.dropdown').toggleClass('isActive')
  }

  function onDropdownItem (event) {
    const $target = $(event.target)
    let data
    // Properly resets value when 'none is selected'
    if ($target.attr('data-value') === 'null') {
      data = 'null'
    } else {
      data = $target.data('value')
    }

    $target
      .closest('.dropdown')
        .removeClass('isActive')
        .find('[data-bind="label"]')
          .text($target.text())
          .attr('data-value', data)

    return false
  }
}

function initResults () {
  const $results = $('.people-container, .papers-container')
  const topPos = $results.offset().top
  const windowHeight = $(window).height()
  const bottomPadding = 10
  const resultsHeight = windowHeight - topPos - bottomPadding

  $results.each(function () {
    $(this).css('max-height', resultsHeight)
  })
}

function hideEmpty () {
  $containers.each(function (index, container) {
    let $container = $(container)
    if ($container.find('.list-group').is(':empty')) {
      $container.addClass('isHidden')
    } else {
      $container.removeClass('isHidden')
    }
  })
}

function startLoad () {
  $results.addClass('isLoading')
  $spinner.addClass('isSpinning')
}

function stopLoad () {
  $spinner.removeClass('isSpinning')
  $results.removeClass('isLoading')
}

// DOM BINDINGS
$(function () {
  initBrand()
  initSearch()
  initDropdown()
  initNavInput()
  initResults()
})

export { slide }

export default {
  slide,
  clearLists,
  startLoad,
  stopLoad,
  hideEmpty
}
