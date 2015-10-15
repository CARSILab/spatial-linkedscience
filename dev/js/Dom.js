module.exports = (function () {

  // dependencies
  var $ = require('jquery');
  var Map = require('./Map.js');
  require('../libs/bootstrap/dist/js/npm.js');

  // DOM CACHING
  var $title = $('.title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $(".people-list");
  var $paperList = $('.paper-list');
  var $search = $('.search');
  var $conference = $('.conference');

  // clears all data off page
  function clear() {

    $title.empty();
    $peopleHeader.empty();
    $paperHeader.empty();
    $peopleList.empty();
    $paperList.empty();
    $search.val('');
    $conference.text('Conference');
    $conference.attr('data-value', 'null');
    for (var i in Map.markers) {
      Map.removeLayer(Map.markers[i]);
    }
    Map.markers = [];
  }

  // DOM BINDINGS
  $(document).ready(function () {

    // onclick  for home page
    $('.navbar-brand').click(function () {
      $('.belt').css('left', '0%');
      window.location.hash = '';
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

  });

  return {
    clear: clear,
    apple: 'hello'
  };
})();
