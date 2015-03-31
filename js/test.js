// to do:
// each page with unique uri
// convert map to leaflet with closeby pins combining to one (leaflet marker cluster)

var prefixes = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix key: <http://spatial.linkedscience.org/context/keyword/>";

// handle search bar
$('form').bind('submit', function(event){
	event.preventDefault();
	if($('#search').val().length > 1){
		clear();
		search( $('#search').val() );
	}
});



// search for authors & papers
function search(input, conference){

	paper_seg = '';
	conference_seg = '?g';

	if(conference != null)
		conference_seg = '<' + conference + '>';

	$query = prefixes + 
	'SELECT DISTINCT ?link ?name ?title ?year ?type ' +
	'{ ' +
		'GRAPH ' + conference_seg + 
		'{ ' +
			'{ ' +
				'?link foaf:name ?name . ' +
				'FILTER regex(?name, "' + input + '", "i") ' + 
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
				'?link dc:subject key:' + input + ' .' +
				'?link dc:title ?title . ' +
				'?link dc:date ?year . ' +
				'?link rdf:type bibo:Chapter . ' +
				'?link rdf:type ?type . ' +
			'} ' +
		'}' +
	'}';

	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){
			$('#authorsheader').html('Author');
			$('#papersheader').html('Papers');

			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value == 'http://xmlns.com/foaf/0.1/Person' ){
			  		$("#people").append('<li class="author"><a href="javascript:selectAuthor(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this author" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			  	else if( json.results.bindings[i].type.value == 'http://purl.org/ontology/bibo/Chapter' ){
			  		$('#papers').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:selectPaper(\'<' + json.results.bindings[i].link.value + '>\')">' + json.results.bindings[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].link.value + '">&rarr;</a></li>');
			  	}
			});
			$('#search').val('');
		}
	);
};

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
				'?paper ' +
					'dc:title ?title ; ' +
					'dc:date ?year ; ' +
					'rdf:type ?type . ' +
			'} ' +
			'UNION ' +
			'{ ' +
					author + 'foaf:knows ?knows . ' +
					'?knows foaf:name ?coname . ' +
					'?knows rdf:type ?type . ' +
			'} ' +	
		'} ' +
	'}';

	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){
			$('#papersheader').html('Papers');
			$('#authorsheader').html('Co-authors/-editors');
			clear();

			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value =='http://purl.org/ontology/bibo/Chapter'){
					$('#papers').append('<li class="paper">(' + json.results.bindings[i].year.value + ') <a href="javascript:selectPaper(\'<' + json.results.bindings[i].paper.value + '>\')">' + json.results.bindings[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + json.results.bindings[i].paper.value + '">&rarr;</a></li>');
				} else {
					$('#people').append("<li class='author'><a href='javascript:selectAuthor(\"<" + json.results.bindings[i].knows.value + ">\")'>" + json.results.bindings[i].coname.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].knows.value + "'>&rarr;</a></li>");
				}
			})
		}
	);
};

// shows everything linked to paper
function selectPaper(paper){

	$query = prefixes + 
	'SELECT DISTINCT  ?title ?author ?name ?coauthors ?year ?homepage ?partOf ?subject ?g ' +
	'{ ' +
		'GRAPH ' + '?g ' + 
		'{ ' +
			paper +
				'dc:title ?title ; ' +
				'dc:date ?year ; ' +
				'foaf:homepage ?homepage ; ' +
				'dc:partOf ?partOf ; ' +
				//'dc:subject ?subject ; ' + 
				'bibo:authorList ?list . ' +
			'?list rdf:first ?author . ' +
			//'?list rdf:rest ?coauthors . ' +	
			'?author foaf:name ?name . ' +
		'} ' +
	'}';

	$.getJSON('/sparql', {query: $query, format: 'json'},
		function(json){
			console.log(json.results.bindings);
		}
	);
};

// clear elements on page
function clear(){
	$('#people').empty();
	$('#papers').empty();
};


