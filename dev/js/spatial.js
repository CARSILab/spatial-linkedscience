var L = require('leaflet');
var Sparql = require('./Sparql.js');
var map = require('./map.js');

// bootstrap js
require('../libs/bootstrap/dist/js/npm.js');

var lastHash = '';

$(document).ready(function () {

  // pollHash
  pollHash();
  setInterval(pollHash, 10);

  // onclick  for home page
  $('.navbar-brand').click(function () {
    $('.belt').css('left', '0%');
    window.location.hash = '';
  });

  // SEARCH BAR
  $('form').bind('submit', function (event) {
    // stops form submission
    event.preventDefault();

    var $text = $('.search').val(),
      $conference = $('.conference').attr('data-value');
    if ($text.length > 1) {
      window.location.hash = lastHash = '';
      $('.belt').css('left', '-100%');
      Sparql.search($text, $conference);
      clear();
    }
  });

  // dropdown selects
  $(document.body).on('click', '.dropdown-menu li', function (event) {
    //event.preventDefault();
    console.log('click!');
    var $target = $(event.currentTarget);

    $target.closest('.btn-group')
      .find('[data-bind="label"]').text($target.text())
      .attr('data-value', $target.data('value'))
      .end()
      .children('.dropdown-toggle').dropdown('toggle');
    return false;

  });

});

// checks hash and loads page accordingly
function pollHash() {
  if (window.location.hash != lastHash) {
    lastHash = window.location.hash;
    var key = '<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>';

    $('.belt').css('left', '-100%');
    if (lastHash.length < 2) {
      clear();
    } else if (lastHash[1] == 'p') {
      Sparql.selectAuthor(key);
    } else if (lastHash[2] == 'f') {
      Sparql.selectAffiliation(key);
    } else {
      Sparql.selectPaper(key);
    }
  }
}

function setHash(hash) {
  window.location.hash = hash.slice(42, -1);
}

// clear elements on page
function clear() {

  $('.title').empty();
  $('.paper-header').empty();
  $('.people-header').empty();
  $('.people-list').empty();
  $('.paper-list').empty();
  $('.search').val('');
  $('.conference').text('Conference');
  $('.conference').attr('data-value', 'null');
  for (var i in markers) {
    map.removeLayer(markers[i]);
  }
  markers = [];
}

// bind test functions to buttons
$('#testAuthor').click(function (event) {
  event.preventDefault();
  Sparql.testAuthor();
});
$('#testPaper').click(function (event) {
  event.preventDefault();
  Sparql.testPaper();
});
