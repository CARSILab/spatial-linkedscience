// to do:
// each page with unique uri
// convert map to leaflet with closeby pins combining to one (leaflet marker cluster)

var prefixes = 'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix spatial: <http://spatial.linkedscience.org/context/> prefix key: <http://spatial.linkedscience.org/context/keyword/>';
var lastHash = '';

// initialize
$(document).ready(function(){

	// leaflet map
	var map = L.map('map', {
		center:[22, -7],
		zoom: 2,
		scrollWheelZoom: false,
	});
	L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
	    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
	}).addTo(map);

	// pollHash
	pollHash();
	setInterval(pollHash, 10);
})

// checks hash and loads page accordingly
function pollHash(){
	if (window.location.hash != lastHash) {
		lastHash = window.location.hash;
		if (lastHash == '') {
			clear();
		} else if (lastHash[1] == 'p') {
			selectAuthor('<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>');
		} else {
			selectPaper('<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>');
		}
	}
}


// handle search bar
$('form').bind('submit', function(event){
	event.preventDefault();
	text = $('#search').val();
	conference = $('#conference').val();
	if( text.length > 1){
		search( text, conference );
		clear();
	}
});

// onclick for home page
$('.navbar-brand').click(function(){
	window.location.hash = ''
})

// search for authors & papers
function search(input, conference){
	window.location.hash = lastHash = '';
	paper_seg = '';
	conference_seg = '?g';

	if(conference != 'null')
		conference_seg = 'spatial:' + conference;

	$query = prefixes + 
	'SELECT DISTINCT ?link ?name ?title ?year ?type ' +
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
				'?link dc:title ?title . ' +
				'FILTER regex(?title, "' + input + '", "i") '+ 
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
		'}' +
	'}' +
	'ORDER BY DESC(?year) ?title ?lastName';


	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){

			// prepare page for data
			conference_part = '';
			if(conference != 'null')
				conference_part = ' >> ' + conference;

			if(json.results.bindings.length == 0)
				$('#infoheader').html('There are no results for <b>' + input + conference_part + '</b>, try searching again.');
			else 
				$('#infoheader').html('Showing results for: <b>' + input + conference_part + '</b>');

			$('#authorsheader').html('Authors');
			$('#papersheader').html('Papers');

			// fill page with data
			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Person' ){
			  		$("#people").append('<li class="author"><a href="javascript:setHash(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this author" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			  	else if( json.results.bindings[i].type.value == 'http://purl.org/ontology/bibo/Chapter' ){
			  		$('#papers').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:setHash(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			});
		}
	);
};

function setHash(hash){
	window.location.hash = hash.slice(42, -1);
}

// shows everything linked to author
function selectAuthor(author){

	$query = prefixes + 
	'SELECT DISTINCT ?name ?paper ?title ?year ?knows ?coname ?type ' +
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
		'} ' +
	'}' +
	'ORDER BY DESC(?year) ?title ?lastName';

	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){
			clear();
			$('#infoheader').html('<b>' + json.results.bindings[0].name.value + '</b>');
			$('#papersheader').html('Papers');
			$('#authorsheader').html('Co-authors/-editors');
			
			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value =='http://purl.org/ontology/bibo/Chapter'){
					$('#papers').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:setHash(\'<' + json.results.bindings[i].paper.value + '>\')">' + json.results.bindings[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].paper.value + '">&rarr;</a></li>');
				} else {
					$('#people').append("<li class='author'><a href='javascript:setHash(\"<" + json.results.bindings[i].knows.value + ">\")'>" + json.results.bindings[i].coname.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].knows.value + "'>&rarr;</a></li>");
				}
			})
		}
	);
};

// shows everything linked to paper
function selectPaper(paper){

	$query = prefixes + 
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

	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){
			clear();

			$('#infoheader').html('<b>' + json.results.bindings[0].title.value + '</b>');
			$('#authorsheader').html('Authors/Co-authors');
			$('#papersheader').html('Paper Info')
			

			$('#papers').append('<li><b>Title</b>: ' + json.results.bindings[0].title.value + '</li>');
			$('#papers').append('<li><b>Year</b>: ' + json.results.bindings[0].year.value + '</li>');
			$('#papers').append('<li><b>Homepage</b>: <a href="' + json.results.bindings[0].homepage.value + '">here</a></li>');
			$('#papers').append('<li><b>Part Of</b>: ' + json.results.bindings[0].partOf.value + '</li>');


			$.each(json.results.bindings, function(i){
				if(i != 0){
					$('#people').append("<li class='author'><a href='javascript:setHash(\"<" + json.results.bindings[i].coauthor.value + ">\")'>" + json.results.bindings[i].name.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].coauthor.value + "'>&rarr;</a></li>");
				}
			});


		}
	);
};

// clear elements on page
function clear(){
	$('#infoheader').empty();
	$('#papersheader').empty();
	$('#authorsheader').empty();
	$('#people').empty();
	$('#papers').empty();
	$('#search').val('');
	$('#conference').val('null');
};


