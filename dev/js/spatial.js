var lastHash = '';
var map;
var markers = [];
var pin = L.icon({
	iconUrl: 'assets/icons/circle.png',
	iconSize: [10, 10],
	iconAnchor: [5, 5],
});

$(document).ready(function(){

	// leaflet map
	map = L.map('map', {
		center:[22, -7],
		zoom: 2,
		scrollWheelZoom: false,
	});

	L.tileLayer('http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
	    attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>',
	}).addTo(map);

	// pollHash
	pollHash();
	setInterval(pollHash, 10);

	// onclick  for home page
	$('.navbar-brand').click(function(){
		$('.belt').css('left','0%');
		window.location.hash = '';
	});

	// SEARCH BAR
	$('form').bind('submit', function(event){
		// stops form submission
		event.preventDefault();

		var $text = $('.search').val(),
				$conference = $('.conference').attr('data-value');
		if( $text.length > 1){
			window.location.hash = lastHash = '';
			$('.belt').css('left', '-100%');
			Sparql.search( $text, $conference );
			clear();
		}
	});

	// dropdown selects
	$(document.body).on('click', '.dropdown-menu li', function(event){

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
function pollHash(){
	if (window.location.hash != lastHash) {
		lastHash = window.location.hash;
		var key = '<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>';

		$('.belt').css('left', '-100%');
		if (lastHash.length < 2) {
			clear();
		} else if (lastHash[1] == 'p') {
			Sparql.selectAuthor(key);
		} else if (lastHash[2] == 'f'){
			Sparql.selectAffiliation(key);
		} else {
			Sparql.selectPaper(key);
		}
	}
}
function setHash(hash){
	window.location.hash = hash.slice(42, -1);
}

// CREATE MAP PIN
function setPin(data){
	// extract lat and long
	var latlong = data.latlong.value.split(' ');
	// create map marker
	var marker = L.marker(
		[parseFloat(latlong[0]), parseFloat(latlong[1])], {
			icon: pin,
			title: data.name.value,
		}).addTo(map);

	// selectAffiliation
	$(marker).click(function(){
		setHash('<' + data.link.value + '>');
	});

	// push marker into array (for later deletion)
	markers.push(marker);
}

// clear elements on page
function clear(){

	$('.title').empty();
	$('.paper-header').empty();
	$('.people-header').empty();
	$('.people-list').empty();
	$('.paper-list').empty();
	$('.search').val('');
	$('.conference').text('Conference');
	$('.conference').attr('data-value', 'null');
	for (var i in markers) { map.removeLayer(markers[i]); }
	markers = [];
}
