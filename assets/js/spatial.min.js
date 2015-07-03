var prefixes = 'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix spatial: <http://spatial.linkedscience.org/context/> prefix key: <http://spatial.linkedscience.org/context/keyword/> prefix ADR: <http://www.w3.org/2001/vcard-rdf/3.0#> ';
var lastHash = '';
var map;
var pin = L.icon({
	iconUrl: 'assets/icons/circle.png',
	iconSize: [10, 10],
	iconAnchor: [5, 5],
});
var markers = [];

// initialize
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

		var $text = $('.search').val();
		var $conference = $('.conference').attr('data-value');
		if( $text.length > 1){
			search( $text, $conference );
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
		if (lastHash.length < 2) {
			clear();
		} else if (lastHash[1] == 'p') {
			selectAuthor('<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>');
		} else if (lastHash[2] == 'f'){
			selectAffiliation('<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>');
		} else {
			selectPaper('<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>');
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

// // // // // // //
// SPARQL QUERIES
// // // // // // //
// search for authors & papers & affiliations
function search(input, conference){
	$('.belt').css('left', '-100%');
	window.location.hash = lastHash = '';

	// refactor to ternary operator
	var conference_seg = conference != 'null' ? 'spatial:' + conference :'?g';


	var query = prefixes +
	'SELECT DISTINCT ?type ?link ?name ?year ?latlong ' +
	'{ ' +
		'GRAPH ' + conference_seg +
		'{ ' +
			'{ ' +
				'?link foaf:name ?name . ' +
				'FILTER regex(?name, "' + input + '", "i") ' +
				'?link foaf:familyName ?lastName . ' +
				'?link rdf:type foaf:Person . ' +
				'?link rdf:type ?type . ' +
			'}' +
			'UNION ' +
			'{ ' +
				'?link dc:title ?name . ' +
				'FILTER regex(?name, "' + input + '", "i") ' +
				'?link dc:date ?year . ' +
				'?link rdf:type bibo:Chapter . ' +
				'?link rdf:type ?type . ' +
			'} ' +
			'UNION ' +
			'{ ' +
				'?link dc:subject key:' + input.split(' ').join('_') + ' . ' +
				// try to use regex for keywords
				//'FILTER regex(?subject, "key:' + input + '", "i") ' +
				'?link dc:title ?title . ' +
				'?link dc:date ?year . ' +
				'?link rdf:type bibo:Chapter . ' +
				'?link rdf:type ?type . ' +
			'} ' +
			'UNION ' +
			'{ ' +
				'?link foaf:name ?name ; ' +
				'FILTER regex(?name, "' + input + '", "i") ' +
				'?link geo:lat_long ?latlong . ' +
				'?link rdf:type foaf:Organization . ' +
				'?link rdf:type ?type . ' +
			'} ' +
		'}' +
	'}' +
	'ORDER BY DESC(?year) ?title ?lastName';


	$.getJSON('/sparql', {query: query, format: 'json'},
		function(json){
			// prepare page for data
			var conference_part = '';
			if(conference != 'null'){
				conference_part = ' >> ' + conference;
			}

			if(json.results.bindings.length === 0){
				$('.title').html('There are no results for <b>' + input + conference_part + '</b>, try searching again.');
			} else {
				$('.title').html('Showing results for: <b>' + input + conference_part + '</b>');
			}

			$('.people-header').html('Authors');
			$('.paper-header').html('Papers');

			// fill page with data
			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Person' )
				{
			  		$(".people-list").append('<li class="author"><a href="javascript:setHash(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this author" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			  	else if( json.results.bindings[i].type.value == 'http://purl.org/ontology/bibo/Chapter' )
			  	{
			  		$('.paper-list').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:setHash(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			  	else if( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Organization' )
			  	{
			  		setPin(json.results.bindings[i]);
			  	}
			});
		}
	);
}


// shows everything linked to author
function selectAuthor(author){
	$('.belt').css('left', '-100%');
	var query = prefixes +
	'SELECT DISTINCT ?name ?paper ?title ?year ?knows ?coname ?type ?affiliation ?latlong ' +
	'{ ' +
		'GRAPH ' + '?g ' +
		'{ ' +
			'{ ' +
				author +
					'foaf:name ?name ; ' +
					'foaf:publications ?paper . ' +
				'?paper dc:title ?title . ' +
				'?paper dc:date ?year . ' +
				'?paper rdf:type ?type . ' +
			'} ' +
			'UNION ' +
			'{ ' +
				author + 'foaf:knows ?knows . ' +
				'?knows foaf:name ?coname . ' +
				'?knows foaf:familyName ?lastName . ' +
				'?knows rdf:type ?type . ' +
			'} ' +
			'UNION ' +
			'{ ' +
				'?affiliation foaf:member ' + author + ' ; ' +
					'foaf:name ?name ; ' +
					'geo:lat_long ?latlong ; ' +
					'rdf:type ?type . ' +
			'} ' +

		'} ' +
	'}' +
	'ORDER BY DESC(?year) ?title ?lastName';

	$.getJSON('/sparql', {query: query, format: 'json'},
		function(json){
			console.log(json.results.bindings);
			clear();
			$('.title').html('<b>' + json.results.bindings[0].name.value + '</b>');
			$('.paper-header').html('Papers');
			$('.people-header').html('Co-authors/-editors');

			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value == 'http://purl.org/ontology/bibo/Chapter')
				{
					$('.paper-list').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:setHash(\'<' + json.results.bindings[i].paper.value + '>\')">' + json.results.bindings[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].paper.value + '">&rarr;</a></li>');
				}
				else if ( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Person')
				{
					$('.people-list').append("<li class='author'><a href='javascript:setHash(\"<" + json.results.bindings[i].knows.value + ">\")'>" + json.results.bindings[i].coname.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].knows.value + "'>&rarr;</a></li>");
				}
				else if ( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Organization')
				{
					setPin(json.results.bindings[i]);
				}
			});
		}
	);
}

// shows everything linked to paper
function selectPaper(paper){
	$('.belt').css('left', '-100%');
	var query = prefixes +
	'SELECT DISTINCT ?title ?authors ?name ?coauthor ?year ?homepage ?partOf ?subject ?g ' +
	'{ ' +
		'GRAPH ' + '?g ' +
		'{ ' +
			'{ ' +
				paper +
					'dc:title ?title ; ' +
					'dc:date ?year ; ' +
					'foaf:homepage ?homepage ; ' +
					'dc:partOf ?partOf . ' +
					// need to get list of subjects without returning the same paper n times for each subject
					//'dc:subject ?subject ; ' +
			'} ' +
			'UNION ' +
			'{ ' +
				paper + 'bibo:authorList ?list . ' +
				'?list rdf:rest*/rdf:first ?coauthor . ' +
				'?coauthor foaf:name ?name . ' +
			'} ' +
		'} ' +
	'}';

	$.getJSON('/sparql', {query: query, format: 'json'},
		function(json){
			clear();

			$('.title').html('<b>' + json.results.bindings[0].title.value + '</b>');
			$('.people-header').html('Authors/Co-authors');
			$('.paper-header').html('Paper Info');


			$('.paper-list').append('<li><b>Year</b>: ' + json.results.bindings[0].year.value + '</li>');
			$('.paper-list').append('<li><b>Homepage</b>: <a href="' + json.results.bindings[0].homepage.value + '">here</a></li>');
			$('.paper-list').append('<li><b>Part Of</b>: ' + json.results.bindings[0].partOf.value + '</li>');


			$.each(json.results.bindings, function(i){
				if(i !== 0){
					$('.people-list').append("<li class='author'><a href='javascript:setHash(\"<" + json.results.bindings[i].coauthor.value + ">\")'>" + json.results.bindings[i].name.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].coauthor.value + "'>&rarr;</a></li>");
				}
			});
		}
	);
}

function selectAffiliation(affiliation){
	$('.belt').css('left', '-100%');
	var query = prefixes +
	'SELECT DISTINCT ?link ?name ?latlong ?location ' +
	'{ ' +
		'{ ' +
			affiliation +
				'foaf:name ?name ; ' +
				'geo:lat_long ?latlong ; ' +
				'ADR:ADR ?location . ' +
		'} ' +
		'UNION ' +
		'{ ' +
			affiliation + 'foaf:member ?members . ' +
			'?members foaf:name ?name . ' +
		'} ' +
	'} ';

	$.getJSON('/sparql', {query: query, format: 'json'},
		function(json){
			clear();

			var data = json.results.bindings;
			console.log(data);
			$('.title').html('<strong>' + data[0].name.value + '</strong>');
			$('.people-header').html('Members');
			$('.paper-header').html('Affiliation Info');

			$('.paper-list').append();
			$('.paper-list').append();
			$('.paper-list').append();
			$('.paper-list').append();
		}
	);
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
