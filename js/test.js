var prefixes = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ";

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

function findAuthor(input){
	$query = prefixes + 'SELECT ?link ?name WHERE { ?link foaf:name ?name. FILTER regex(?name, "' + input + '", "i") ?link rdf:type foaf:Person }';

	$.getJSON("/sparql", {query: $query , format: "json" }, 
		function(json){
			$('#authorsheader').html('Author');
			$.each(json.results.bindings, function(i){
				$('#people').append('<li><a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].name.value + '</a></li>')
				console.log(json.results.bindings[i])
			})

		})
}

function findPaper(input){
	$query = prefixes + 'SELECT ?link ?title WHERE { ?link dc:title ?title. FILTER regex(?title, "' + input + '", "i") ?link rdf:type bibo:Chapter }';

	$.getJSON("/sparql", {query: $query , format: "json" },
		function(json){
			$('#papersheader').html('Paper');
			$.each(json.results.bindings, function(i){
				$('#papers').append('<li><a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].title.value + '</a></li>')
			})
		})
}

function initialize(){
	if($.urlParam('input') != 0){
		findAuthor($.urlParam('input').replace(/\+/g," "))
		findPaper($.urlParam('input').replace(/\+/g," "))
	}
};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

