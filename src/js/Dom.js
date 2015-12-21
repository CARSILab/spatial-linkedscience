var Dom = (function () {

  // DOM CACHING
  var $title = $('.title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $('.people-list');
  var $paperList = $('.paper-list');
  var $mainSearch = $('#main-search');
  var $navSearch = $('#nav-search');
  var $conference = $('#conference');
  var $belt = $('.belt');

  // clears all data off page
  function clear() {

    $title.empty();
    $peopleHeader.empty();
    $paperHeader.empty();
    $peopleList.empty();
    $paperList.empty();
    $mainSearch.val('');
    $navSearch.val('');
    $conference.text('Conference');
    $conference.attr('data-value', 'null');
    for (var i in Map.markers) {
      Map.removeLayer(Map.markers[i]);
    }
    Map.markers = [];
  }

  function slide(direction){
    if(direction === 'left'){
      $belt.css('left', '0%');
      window.location.hash = '';
      $navSearch.hide();
    } else if (direction === 'right') {
      $belt.css('left', '-100%');
      $navSearch.show();
    }
  }

  // DOM BINDINGS
  $(document).ready(function () {

    // onclick  for home page
    $('.navbar-brand').click(function () {
      slide('left');
    });

    // dropdown selects
    $(document.body).on('click', '.dropdown-menu li', function (event) {
      //event.preventDefault();
      var $target = $(event.currentTarget);

      $target
        .closest('.btn-group')
        .find('[data-bind="label"]')
        .text($target.text())
        .attr('data-value', $target.data('value'))
        .end()
        .children('.dropdown-toggle')
        .dropdown('toggle');
      return false;
    });

    // initially hide navSearch
    $navSearch.hide();

  });

  return {
    clear: clear,
    slide: slide
  };
})();
