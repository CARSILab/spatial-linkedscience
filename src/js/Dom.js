const Dom = (function () {
  'use strict';

  // DOM CACHING
  const $resultsContainer = $('.results-container');
  const $title = $('.results-title');
  const $peopleHeader = $('.people-header');
  const $paperHeader = $('.papers-header');
  const $peopleList = $('.people-list');
  const $paperList = $('.papers-list');
  const $mainSearch = $('#main-search');
  const $navSearch = $('#nav-search');
  const $conference = $('#dropdown-selection');
  const $belt = $('.belt');
  const $spinner = $('.icon-spinner');

  // Clears all data from the page and resets the map
  function clear() {
    // $title.empty();
    // $peopleHeader.empty();
    // $paperHeader.empty();
    $peopleList.empty();
    $paperList.empty();
    $mainSearch.val('');
    $navSearch.val('');
    $conference.text('Conference');
    $conference.attr('data-value', 'null');
    Map.resetMap();
  }

  // Switches between the landing page and the results page by sliding the 'conveyor belt' across the viewport
  // then calls clear()
  function slide(direction){
    if(direction === 'left'){
      $belt.css('left', '0%');
      $navSearch.hide();
      window.location.hash = '';
    } else if (direction === 'right') {
      $belt.css('left', '-100%');
      $navSearch.show();
    }
    clear();
  }

  // Clicking the logo in the navbar will bring you to the landing page
  function initBrand(){
    $('.navbar-brand').on('click', function() {
      slide('left');
    });
  }

  //
  function initSearch() {
    $navSearch.hide();

    $('#main-form, #nav-form').on('submit', function(event) {
      event.preventDefault();

      // Hide the navSearch bar by default
      const selector = `#${$(event.currentTarget).attr('id').replace('form', 'search')}`;
      const key = $(selector).val();
      const conf = $('#dropdown-selection').attr('data-value');

      if (key.length > 1) {
        window.location.hash = `search?${$.param({key, conf})}`;
      }
    });
  }

  // Clicking a dropdown item will show the selection text in the button and pass it to the form once it is submitted
  // ** Got this from the internet and tweaked **
  function initDropdown() {
    $('.dropdown-item').on('click', function(event) {
      let data;
      const $target = $(event.currentTarget);

      // Properly resets value when 'none is selected'
      if ($target.attr('id') === 'dropdown-reset' ) {
        data = 'null';
      } else {
        data = $target.data('value');
      }

      $target
        .closest('.btn-group')
        .find('[data-bind="label"]')
        .text($target.text())
        .attr('data-value', data)
        .end()
        .children('.dropdown-toggle')
        .dropdown('toggle');

      // Same as calling event.preventDefault and event.stopPropagation
      return false;
    });
  }

  function initResults() {
    const $results = $('.people-container, .papers-container');
    const topPos = $results.offset().top;
    const windowHeight = $(window).height();
    const bottomPadding = 10;
    const resultsHeight = windowHeight - topPos - bottomPadding;

    console.log($title.height());
    console.log($peopleHeader.height());
    console.log($paperHeader.height());
    console.log(topPos);

    $results.each(function(){
      $(this).css('height', resultsHeight);
    });
  }

  function startLoad() {
    $resultsContainer.hide();
    $spinner.show();
  }

  function stopLoad() {
    $spinner.hide();
    $resultsContainer.show();
  }

  // DOM BINDINGS
  $(function() {
    initBrand();
    initSearch();
    initDropdown();
    initResults();
  });

  return {
    slide,
    startLoad,
    stopLoad
  };
})();
