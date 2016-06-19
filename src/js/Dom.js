import $ from 'jquery'
import { resetMap } from './Plot.js'
import Templates from './Templates.js'
import Sparql from './Sparql.js'

// DOM Caching
const $results = $('#results')
const $containers = $('.papers, .people')
const $peopleList = $('#people-list')
const $paperList = $('#papers-list')
const $homeSearch = $('#home-search')
const $navSearch = $('#nav-search')
const $navInputGroup = $('#navInputGroup')
const $conference = $('#home-conf')
const $belt = $('#belt')
const $spinner = $('#loading-spinner')

// Clears all input values and resets map
function clear () {
  $homeSearch.val('')
  $navSearch.val('')
  $conference.text('Conference')
  $conference.data('value', 'null')
  resetMap()
}

// Clear results
function clearLists () {
  $peopleList.empty()
  $paperList.empty()
}

// Switches between the landing page and the results page by sliding the 'conveyor belt' across the viewport
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

// Expands and collapses navbar search
function initNavInput () {
  $navInputGroup.on('click', expand)
  $navSearch.on('focus', expand)
  $navSearch.on('blur', collapse)

  function expand (e) {
    $navInputGroup.removeClass('isCollapsed')
    if (e.type === 'click') {
      $navSearch.focus()
    }
  }

  function collapse () {
    $navInputGroup.addClass('isCollapsed')
  }
}

// Override forms to make custom API calls
function initSearch () {
  $('#home-form, #nav-form').on('submit', function (event) {
    event.preventDefault()

    // Name of form we are currently working with
    //   ie: 'home' or 'nav'
    var currentForm = $(event.currentTarget).attr('id').split('-')[0]
    var searchSelector = '#' + currentForm + '-search'
    var confSelector = '#' + currentForm + '-conf'

    var key = encodeURIComponent($(searchSelector).val())
    var conf = $(confSelector).data('value') || 'null'

    if (key.length > 1) {
      window.location.hash = `search?${$.param({key, conf})}`
    }
  })
}

// Custom dropdown
function initDropdown ($dd) {
  var $label = $dd.find('.js-dd-label')
  var $menu = $dd.find('.js-dd-menu')

  // ASYNC Get Conferences
  // $.getJSON('/sparql', {query: Sparql.conferenceQuery,format: 'json'})
  $.when(Sparql.conferenceHardCode()) // hard code values until I figure out API call
  .then(function (confs) {
    // console.log(JSON.stringify(confs, null, 4))
    // Render Dropdown Menu
    $menu.append(Templates.dropdownItems.render({confs}))
  })

  // Select Option
  $menu.children().on('click', function (e) {
    e.stopPropagation()
    var $this = $(this)
    $label.text($this.text())
    $label.data('value', $this.data('value'))
    closeDropdown()
  })

  // Toggle Dropdown Menu
  $dd.on('click focus blur', openDropdown)

  // Opens the Dropdown Menu
  function openDropdown (e) {
    e.stopPropagation()
    $(this).toggleClass('isActive')
    $(document).on('click', closeDropdown)
  }

  // Closes the Dropdown Menu
  function closeDropdown () {
    $dd.removeClass('isActive')
    $(document).off('click', closeDropdown)
  }
}

// Sets height of result containers to that the page wont scroll
function initResults () {
  const $containers = $('#people-container, #papers-container')
  const topPos = $containers.offset().top
  const windowHeight = $(window).height()
  const bottomPadding = 10
  const resultsHeight = windowHeight - topPos - bottomPadding

  $containers.each(function () {
    $(this).css('max-height', resultsHeight)
  })
}

//
function initTabbedContainer () {
  var $tabs = $('.js-tab')
  var $panels = $('.js-panel')

  $tabs.on('click', function (e) {
    var $target = $(e.currentTarget)
    var tabName = $target.data('tab')

    $tabs.removeClass('isActive')
    $panels.removeClass('isActive')

    $target.addClass('isActive')
    $(`[data-panel=${tabName}]`).addClass('isActive')
  })
}

// Hide results container if empty
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

// Show loading spinner
function startLoad () {
  $results.addClass('isLoading')
  $spinner.addClass('isSpinning')
}

// Hide loading spinner
function stopLoad () {
  $spinner.removeClass('isSpinning')
  $results.removeClass('isLoading')
}

// Init all the DOM stuff on load
$(function () {
  initSearch()
  initDropdown($('#home-dropdown'))
  initNavInput()
  // initResults()
  initTabbedContainer()
})

export { slide }

export default {
  slide,
  clearLists,
  startLoad,
  stopLoad,
  hideEmpty
}
