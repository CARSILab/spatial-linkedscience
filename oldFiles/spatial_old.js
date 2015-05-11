var prefixes = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ";
	
var map;
var markers = [];
var traces = [];

$('#aboutlink').click(function() {
  $('#about').slideDown('200');
});

$('#aboutoff').click(function() {
  $('#about').slideUp('200');
});

// making google map marker?
var image = new google.maps.MarkerImage('icons/circle.png',
      // marker size
      new google.maps.Size(10, 10),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image
      new google.maps.Point(5, 5));

// initialize google map
function initialize() {
	var myOptions = {
		zoom: 2,
		scrollwheel: false,
		mapTypeControl: false,
		navigationControl: true,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		},
		center: new google.maps.LatLng(22, -7),
		mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);	

    resetHeadings();
	showEverything();
}

// clear map markers & connection lines
function clearOverlays() {
  	if (markers) {
    	for (i in markers) {
      		markers[i].setMap(null);
    	}
  	}
  	markers = new Array();

  	if(traces){
		for (i in traces) {
			traces[i].setMap(null);
		}
	}
	traces = new Array();
}

// show all links on page (clearing any filters)
function showEverything(){
	
	resetHeadings();
	loadAffiliations();
	loadConferences();
	loadAuthors();
	loadPapers();
	loadYears(); 
		
	}

function selectAuthor(author){
	resetHeadings();
	loadPapers(null, author, null, null, null);
	loadAuthors(null, author, null, null, null);
	loadYears(null, author, null, null, null);
	loadAffiliations(null, author, null, null, null);
	loadConferences(null, author, null, null, null); }

function selectPaper(paper){
	resetHeadings();
	loadSinglePaper(paper);
	loadAuthors(paper, null, null, null, null);
	loadYears(paper, null, null, null, null);
	loadAffiliations(paper, null, null, null, null);
	loadConferences(paper, null, null, null, null); }

function selectYear(year){
	resetHeadings();	
		
	// display this message for each selection query??
	$('#info').html('Showing data for the year <b>' + year + '</b> &ndash; <a class="switchfilter" href="javascript:showEverything()">show everything</a>.');
	
	loadPapers(null, null, year, null, null);
	loadAuthors(null, null, year, null, null);
	loadYears(null, null, year, null, null);
	loadAffiliations(null, null, year, null, null);
	loadConferences(null, null, year, null, null); }

function selectAffiliation(affiliation){
	resetHeadings();	
	loadPapers(null, null, null, affiliation, null);
	loadAuthors(null, null, null, affiliation, null);
	loadYears(null, null, null, affiliation, null);
	loadAffiliations(null, null, null, affiliation, null);
	loadConferences(null, null, null, affiliation, null); }

function selectConference(conference){
	resetHeadings();
	
	loadPapers(null, null, null, null, conference);
	loadAuthors(null, null, null, null, conference);
	loadYears(null, null, null, null, conference);
	loadAffiliations(null, null, null, null, conference);
	loadSingleConference(conference); }

function loadAffiliations(paper, author, year, affiliation, conference){
	
	clearOverlays();
	
	// standard query if no filters apply:
	var query = prefixes + "SELECT DISTINCT ?org ?name ?lat ?lon WHERE { GRAPH ?g { ?org a foaf:Organization ; geo:lat ?lat ; geo:long ?lon ; foaf:name ?name. }  	}";
	
	if(paper != null){ // shows the affiliations of all authors of this paper at the time of publication: // TODO make coordinates optional to include affiliations which are not georeferenced
		query = prefixes + "SELECT DISTINCT ?org ?name ?lat ?lon		WHERE { 		  GRAPH ?g { 		    ?author foaf:publications <" + paper + "> .		   <" + paper + "> dc:date ?date .		    ?reif rdfs:subject ?org ;		          rdfs:predicate foaf:member ;		          rdfs:object ?author ;		          dc:date ?date .		    ?org a foaf:Organization ; 		         geo:lat ?lat ; 		         geo:long ?lon ; 		    foaf:name ?name.}  	}";	
	}
	
	if(author != null){ // all affiliations for this author, ordered by year		
		query = prefixes + "SELECT DISTINCT ?org ?name ?lat ?lon ?date		WHERE { 		  GRAPH ?g { 		    ?reif rdfs:subject ?org;		          rdfs:predicate foaf:member ;		          rdfs:object <" + author + "> ;		          dc:date ?date .		    ?org a foaf:Organization ; 		         geo:lat ?lat ; 		         geo:long ?lon ; 		         foaf:name ?name.}  			} ORDER BY DESC(?date)";	
	}
	
	if(year != null){ // all current affiliations of authors who published this year
		query = prefixes + "SELECT DISTINCT ?org ?name ?lat ?lon WHERE { GRAPH ?g { ?author foaf:publications ?paper . ?org foaf:member ?author . ?paper dc:date \"" + year + "\" . ?org a foaf:Organization ; geo:lat ?lat ; geo:long ?lon ; foaf:name ?name.}  	}";
	}
	
	if(conference != null){ 
		query = prefixes + "SELECT DISTINCT ?org ?name ?lat ?lon WHERE { GRAPH <" + conference + "> { ?org a foaf:Organization ; geo:lat ?lat ; geo:long ?lon ; foaf:name ?name. }  	}";
	}
	
	if(affiliation != null){ 
		query = prefixes + "SELECT DISTINCT ?name ?lat ?lon WHERE { GRAPH ?g { <" + affiliation  + "> geo:lat ?lat ; geo:long ?lon ; foaf:name ?name.}  	}";
	}

	
	//console.log($query);
	$("#loading").slideDown();
	
	$.getJSON("/sparql", { query: query , 
						   format: "json" }, 	
		function(json){
			
			var latlngbounds = new google.maps.LatLngBounds( );
			
			if(affiliation != null){ 
			
				latlon = new google.maps.LatLng(parseFloat(json.results.bindings[0].lat.value), parseFloat(json.results.bindings[0].lon.value));
				var marker = new google.maps.Marker({
					position: latlon, 
					map: map,
					title: json.results.bindings[0].name.value,
					icon: image 
				});
				latlngbounds.extend(latlon);
				google.maps.event.addListener(marker, 'click', function() {
			    	selectAffiliation(affiliation);
				});
				markers.push(marker);
				
				$('#info').html('Showing data for <b><a href="' + affiliation + '" target="_blank"">' + json.results.bindings[0].name.value + '</a></b> &ndash; <a class="switchfilter" href="javascript:showEverything()">show everything</a>.');
			
			}else if(author != null){
				
				// show markers with years
				$.each(json.results.bindings, function(i){
					latlon = new google.maps.LatLng(parseFloat(json.results.bindings[i].lat.value), parseFloat(json.results.bindings[i].lon.value));
					var marker = new MarkerWithLabel({
						position: latlon, 
						map: map,
						title: json.results.bindings[i].name.value,
						labelContent: json.results.bindings[i].date.value,
						labelAnchor: new google.maps.Point(22, -7),
						labelClass: "labels", // the CSS class for the label
						labelStyle: {opacity: 0.85},
						icon: image 
					});
					latlngbounds.extend(latlon);					
					google.maps.event.addListener(marker, 'click', function() {
				    	selectAffiliation(json.results.bindings[i].org.value);
					});
					markers.push(marker);
				})
				
				// show author trace:
				$.each(markers, function(i){		
					if(i+1 < markers.length){
						var trace = new google.maps.Polyline({
						    path: [markers[i].getPosition(), markers[i+1].getPosition()],
						    strokeColor: "#FF0000",
							geodesic: true,
						    strokeOpacity: 0.8,
						    strokeWeight: 2
							});

						trace.setMap(map);
						traces.push(trace);
					}
				})
				
			}else{
				
				$.each(json.results.bindings, function(i){
					latlon = new google.maps.LatLng(parseFloat(json.results.bindings[i].lat.value), parseFloat(json.results.bindings[i].lon.value));

					var marker = new google.maps.Marker({
						position: latlon, 
						map: map,
						title: json.results.bindings[i].name.value,
						icon: image 
					});
					latlngbounds.extend(latlon);
					google.maps.event.addListener(marker, 'click', function() {
				    	selectAffiliation(json.results.bindings[i].org.value);
					});
					markers.push(marker);
				})
				
			}
			// rescale map to fit all markers:
			map.fitBounds( latlngbounds );
			
			// TODO if there are no affiliations to show, zoom out to world
			
			// prevent zooming in or out too far:
			if(map.getZoom() > 8){
				map.setZoom(8);
			};
			if(map.getZoom() < 2){
				map.setZoom(2);
			}
			
			$("#loading > h3").html("done!");
			$("#loading").slideUp(function(){
				$("#loading > h3").html("loading...");
			});
		}
	);
}

function loadConferences(paper, author, year, affiliation, conference){

	$('.conference').remove();
	
	// construct the query fragments:	
	paperFragment = "";
	authorFragment = "";
	yearFragment = "";
	affiliationFragment = "";
	conferenceFragment = "?conference a <http://linkedevents.org/ontology/Event> ; a bibo:Series ; dc:title ?title . ";
	
	if(paper != null){ // load conference for this paper
		   paperFragment = "<" + paper + "> ?a ?b ."; // simply checks in which named graph any data about this paper are
	}
	
	if(author != null){ // load conferences for this author
		   authorFragment = "<" + author + "> ?a ?b . "; // simply checks in which named graph any data about this author are
	}
	
	if(year != null){ // load conferences in this year
	    yearFragment = "?a dc:date \"" + year + "\" . ";
	}
	
	if(affiliation != null){ // load conferences where authors from this institution have published
		affiliationFragment = "?a ?b <" + affiliation +"> . "
	}

	if(conference != null){ // load this conference
		conferenceFragment = "<" + conference + "> a ?a; dc:title ?title . ?conference a ?a .";
	}

	$query = prefixes + "SELECT DISTINCT ?conference ?title	WHERE { GRAPH ?conference { " + conferenceFragment + paperFragment + authorFragment + yearFragment + affiliationFragment + " }} ORDER BY ?title";
	
	//console.log("QUERY FOR CONFERENCES: " + $query);
	
	$.getJSON("/sparql", {  query: $query , 
							format: "json" }, 	
		function(json){
			$.each(json.results.bindings, function(i){
				$("#conferences").append("<span class='conference'><a href='javascript:selectConference(\"" + json.results.bindings[i].conference.value + "\")'>" + json.results.bindings[i].title.value + "</a></span> ");
			})

		}
	);
}


function loadSingleConference(conference){

	$('.conference').remove();	

	$query = prefixes + "SELECT DISTINCT ?title	WHERE { GRAPH ?g { <" + conference + "> a bibo:Series; dc:title ?title .}}";
	
	$.getJSON("/sparql", {  query: $query , 
							format: "json" }, 	
		function(json){
			$("#conferences").append("<span class='conference'><a href='javascript:selectConference(\"" + conference + "\")'>" + json.results.bindings[0].title.value + "</a></span>");  
			
			$('#info').html('Showing data for the <b><a href="' + conference + '" target="_blank"">' + json.results.bindings[0].title.value + ' conference series</a></b> &ndash; <a class="switchfilter" href="javascript:showEverything()">show everything</a>.');
			
			}
	);
}

function loadYears(paper, author, year, affiliation, conference){

	// remove current list of years before we load the new ones:
	$('.year').remove();
	
	// construct the query fragments:	
	paperFragment = "?paper a bibo:Chapter . ?paper";
	authorFragment = "";
	yearFragment = "?year";
	affiliationFragment = "";
	conferenceFragment = "?g";
	
	if(paper != null){ // year of publication for the given paper
		paperFragment = "<" + paper + ">"; }
	
	if(author != null){ // only years in which this author has pubished
		authorFragment = " <" + author + "> foaf:publications ?paper . "; }
	
	if(year != null){ // just one year
	    yearFragment = "?year ; dc:date \"" + year + "\"";
	}
	
	if(affiliation != null){ // only years in which authors from this institution have published
		affiliationFragment = "?author foaf:publications ?paper . <" + affiliation + "> foaf:member ?author. ";
	}

	if(conference != null){ // only years in which this conference has taken place
		conferenceFragment = "<" + conference + ">"; // simply pick by named graph 
	}
	
	$query = prefixes + "SELECT DISTINCT ?year WHERE {   GRAPH " + conferenceFragment + " { " + paperFragment +" dc:date " + yearFragment + " . " + authorFragment + affiliationFragment + "}  } ORDER BY ?year" ;
	
	
	//console.log($query);
	
	
	$.getJSON("/sparql", {  query: $query , 
							format: "json" }, 	
		function(json){			
			
			// if there's just one year to show, adjust header:					
			if(json.results.bindings.length == 1){  // TODO klappt nicht
					$('#yearsheader').html('Year of publication');
			}

			$.each(json.results.bindings, function(i){
				$("#years").append("<span class='year'><a href='javascript:selectYear(" + json.results.bindings[i].year.value + ")'>" + json.results.bindings[i].year.value + "</a></span> ");
			})

		}
	);
}


function loadPapers(paper, author, year, affiliation, conference){
	
	// remove current list of authors before we load the new ones:
	$('.paper').remove();
	
	// construct the query fragments:	
	paperFragment = "";
	authorFragment = "";
	yearFragment = "";
	affiliationFragment = "";
	conferenceFragment = "?g";
	
	if(paper != null){ 
		paperFragment = "<" + paper + "> dc:title ?title . "
	}
	
	if(author != null)
		authorFragment = "<" + author + "> foaf:publications ?chapter ."; 
	
	if(year != null)
		yearFragment = "?chapter dc:date \"" + year + "\" ."; 
	
	if(affiliation != null){
		affiliationFragment = "?author foaf:publications ?chapter .  <" + affiliation + "> foaf:member ?author ."
	}

	if(conference != null){
		conferenceFragment = "<" + conference + ">"; // simply pick by named graph
	}
	
	$query = prefixes + "SELECT DISTINCT ?chapter ?title WHERE {   GRAPH " + conferenceFragment + " { " + paperFragment + " ?chapter a bibo:Chapter ; dc:title ?title ; bibo:pageStart ?startpage . " + yearFragment + authorFragment + affiliationFragment + "} } ORDER BY DESC(?year) ?startpage" ;
	
	
	$.getJSON("/sparql", { query: $query , 
						   format: "json"}, 	
		function(json){
			$.each(json.results.bindings, function(i){
				
				if(json.results.bindings.length == 1){  // TODO klappt nicht
						$('#papersheader').html('Paper');
				}
				
				
				$("#papers").append("<li class='paper'><a href='javascript:selectPaper(\"" + json.results.bindings[i].chapter.value + "\")'>" + json.results.bindings[i].title.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this paper' href='" + json.results.bindings[i].chapter.value + "'>&rarr;</a></li>");
			})
		}
	);
}

function loadSinglePaper(paper){
	$('.paper').remove();

	$('#papersheader').html('Paper details');
	$('#authorsheader').html('Authors');
	$('#yearsheader').html('Year of publication');
	$('#conferencesheader').html('Conference');

	// load paper details:
	$query= prefixes + "SELECT ?title ?startPage ?endPage ?doi WHERE {	 GRAPH ?g{<" + paper + "> bibo:pageStart ?startPage ; bibo:pageEnd ?endPage ; bibo:doi ?doi ; dc:title ?title . }}";
	
	$.getJSON("/sparql", { 	query: $query , 
							format: "json" }, 	
		function(json){ 
				// update header
				$('#info').html('Showing data for paper <b><a href="' + paper + '" target="_blank"">' + json.results.bindings[0].title.value + '</a></b> &ndash; <a class="switchfilter" href="javascript:showEverything()">show everything</a>.');
				// show paper details:
				$('#paperdetails').html('<p>Pages ' + json.results.bindings[0].startPage.value + '&ndash;' + json.results.bindings[0].endPage.value + ', <a href="http://dx.doi.org/'+ json.results.bindings[0].doi.value+'" target="_blank">DOI:'+ json.results.bindings[0].doi.value+'</a></p>');
		}
	);
	
}

function loadAuthors(paper, author, year, affiliation, conference){

	// remove current list of authors before we load the new ones:
	$('.author').remove();
	
	// standard query without filters:
 	$query = prefixes + "SELECT DISTINCT ?name ?person WHERE { GRAPH ?g { ?person a foaf:Person; foaf:name ?name; foaf:familyName ?lastName . } } ORDER BY ?lastName" ;
	
	
	if(author != null){ // // just a specific author - show co-authors:
		//author info + header:
		$('#authorsheader').html('Co-authors/-editors')

		$query = prefixes + "SELECT DISTINCT ?name 	WHERE { GRAPH ?g { <" + author +"> foaf:name ?name. }}" ;

		$.getJSON("/sparql", { 	query: $query , 
								format: "json" }, 	
			function(json){
					$('#info').html('Showing data for author <b><a href="' + author + '" target="_blank"">' + json.results.bindings[0].name.value + '</a></b> &ndash; <a class="switchfilter" href="javascript:showEverything()">clear filter</a>.');
			}
		);
		
		// query for coauthors to execute later:
		$query = prefixes + "SELECT DISTINCT ?name ?person	WHERE { GRAPH ?g { <" + author + "> foaf:publications ?paper . ?person foaf:publications ?paper . ?person a foaf:Person; foaf:name ?name; foaf:familyName ?lastName . FILTER ( ?person != <" + author + "> ) }} ORDER BY ?lastName" ; 

	}
	
	if(year != null){ // all authors who have published in this year:
 		$query = prefixes + "SELECT DISTINCT ?name ?person WHERE { GRAPH ?g { ?person a foaf:Person; foaf:name ?name; foaf:familyName ?lastName ; foaf:publications ?paper . ?paper dc:date \"" + year + "\" . }  } ORDER BY ?lastName" ; }

	if(affiliation != null){ // all authors from this institution
		$query = prefixes + "SELECT DISTINCT ?name ?person WHERE { GRAPH ?g { ?person a foaf:Person ; foaf:name ?name; foaf:familyName ?lastName . <" + affiliation + "> foaf:member ?person . } } ORDER BY ?lastName" ;  }

	if(conference != null){ // all authors who have published at this conference series.
		$query = prefixes + "SELECT DISTINCT ?name ?person WHERE { GRAPH <" + conference + "> { ?person a foaf:Person; foaf:name ?name; foaf:familyName ?lastName . } } ORDER BY ?lastName" ; }
	
	if(paper != null){ // all authors of the paper in authorship order!
		$query = prefixes + "SELECT ?name ?person WHERE { GRAPH ?g { <" + paper + "> bibo:authorList ?list . ?list rdf:rest*/rdf:first ?person . ?person foaf:name ?name . }}";
	}
	
	$.getJSON("/sparql", { 	query: $query , 
							format: "json" }, 	
		function(json){
			$.each(json.results.bindings, function(i){
				
				if(json.results.bindings.length == 1){  // TODO klappt nicht
						$('#authorsheader').html('Author');
				}
				
				$("#people").append("<li class='author'><a href='javascript:selectAuthor(\"" + json.results.bindings[i].person.value + "\")'>" + json.results.bindings[i].name.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].person.value + "'>&rarr;</a></li>");
			})

		}
	);
	
}


function resetHeadings(){
	$('#info').html('Showing all data &ndash; no filters active');
	$('#search').val('');
	$('#conferencesheader').html('Conferences');		
	$('#authorsheader').html('Authors &amp; editors');
	$('#yearsheader').html('Years of publication');
	$('#papersheader').html('Papers');
	$('#affiliationsheader').html('Affiliations');
	$('#paperdetails').html('');
}


// event handlers for author/paper search
$("input#search").keyup(function(event){
	if (event.keyCode == 27) {
            $(this).val("");
            $("li.author, li.paper").removeClass("hidden");
            resetHeadings();
    }else{
    	var needle = $(this).val().toLowerCase();
		if(needle.length > 0){
			$('#info').html('Showing authors and papers containing <strong>'+needle+'</strong> &ndash; <a class="switchfilter" href="javascript:showEverything()">show everything</a>.');
			$("li.author, li.paper").each(function(){
				var haystack = $(this).find("a").html().toLowerCase();
				if(haystack.indexOf(needle) != -1){ //found
					$(this).removeClass("hidden");
				}else{  // not found
					$(this).addClass("hidden");
				}
			})
		}else{
			resetHeadings();
		}	
    }

	
});