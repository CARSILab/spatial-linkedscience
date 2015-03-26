// each page with uri and ajax
// convert map to leaflet
// closeby pins combining to one (leaflet marker cluster)




var prefixes = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix key: <http://spatial.linkedscience.org/context/keyword/>";

function findAuthors(author, conference){

	paper_seg = '';
	conference_seg = '?g';


	if(conference != null)
		conference_seg = '<' + conference.replace(/%2F/g,"/").replace(/%3A/g,":") + '>';

	$query = prefixes + 
	'SELECT DISTINCT ?link ?name ' +
	'{ ' +
		'GRAPH ' + conference_seg + 
		'{ ' +
			'?link foaf:name ?name . ' +
			'FILTER regex(?name, "' + author + '", "i") ' + 
			'?link rdf:type foaf:Person . ' +
		'}' +
	'}';

	
	$.getJSON("/sparql", {query: $query , format: "json" }, 
		function(json){
			$('#authorsheader').html('Author');
			$.each(json.results.bindings, function(i){
				//$('#people').append('<li class author><a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].name.value + '</a></li>');
			  	$("#people").append("<li class='author'><a href='javascript:selectAuthor(\"<" + json.results.bindings[i].link.value + ">\")'>" + json.results.bindings[i].name.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].link.value + "'>&rarr;</a></li>");

			});
		}
	)
};

function findPapers(paper, conference){

	conference_seg = '?g';

	if(conference != null)
		conference_seg = '<' + conference.replace(/%2F/g,"/").replace(/%3A/g,":") + '>';

	$query = prefixes + 
			'SELECT DISTINCT ?link ?title ?year' +
			'{ ' +
				'GRAPH ' + conference_seg + 
				'{ ' +
					'{ ' +
						'?link dc:title ?title . ' +
						'FILTER regex(?title, "' + paper + '", "i") '+ 
						'?link rdf:type bibo:Chapter . ' +
						'?link dc:date ?year . ' +
					'} ' +
					'UNION ' +
					'{ ' +
						'?link dc:subject key:' + paper + ' .' +
						'?link dc:title ?title . ' +
						'?link rdf:type bibo:Chapter . ' +
						'?link dc:date ?year . ' +
					'} ' +		
				'} ' +		 
			'}' + 
			'ORDER BY DESC(?year) ?title';

	$.getJSON("/sparql", {query: $query , format: "json"},
		function(json){
			$('#papersheader').html('Papers');
			$.each(json.results.bindings, function(i){
				$('#papers').append('<li>(' + json.results.bindings[i].year.value + ') <a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].title.value + '</a></li>');
			}); 
		}
	)
};

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
			console.log(json.results.bindings)
			$.each(json.results.bindings, function(i){
				if( json.results.bindings[i].type.value =='http://purl.org/ontology/bibo/Chapter'){
					$('#papers').append('<li>(' + json.results.bindings[i].year.value + ') <a href="' + json.results.bindings[i].paper.value + '">' + json.results.bindings[i].title.value + '</a></li>');
				} else {
					$('#people').append("<li class='author'><a href='javascript:selectAuthor(\"<" + json.results.bindings[i].knows.value + ">\")'>" + json.results.bindings[i].coname.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + json.results.bindings[i].knows.value + "'>&rarr;</a></li>");
				}
			})
		}
	)
};


function initialize(){
	if($.urlParam('input') != 0){
		findAuthors($.urlParam('input').replace(/\+/g," "), $.urlParam('conference'));
		findPapers($.urlParam('input').replace(/\+/g," "), $.urlParam('conference'));
	}
};

function clear(){
	$('#people').empty();
	$('#papers').empty();
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    } else {
       return results[1] || 0;
    }
};
