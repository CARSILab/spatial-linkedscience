var Dom = (function () {

  // DOM CACHING
  var $title = $('.title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $('.people-list');
  var $paperList = $('.paper-list');
  var $mainSearch = $('#main-search');
  var $navSearch = $('#nav-search');
  var $conference = $('#dropdown-selection');
  var $belt = $('.belt');

  // clears all data off page
  function clear() {
    console.log('calling Dom.clear()');
    $title.empty();
    $peopleHeader.empty();
    $paperHeader.empty();
    $peopleList.empty();
    $paperList.empty();
    $mainSearch.val('');
    $navSearch.val('');
    $conference.text('Conference');
    $conference.attr('data-value', 'null');
    Map.clearMap();
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
      var $target = $(event.currentTarget);
      var data;

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

        console.log($('#dropdown-selection').attr('data-value'));
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
