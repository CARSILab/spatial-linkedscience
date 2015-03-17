var prefixes = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix key: <http://spatial.linkedscience.org/context/keyword/>";


function findAuthor(input, conference){

	conference_seg = '?g';

	if(conference != null)
		conference_seg = '<' + conference.replace(/%2F/g,"/").replace(/%3A/g,":") + '>';

	$query = prefixes + 
			'SELECT DISTINCT ?link ?name ' +
			'{ ' +
				'GRAPH ' + conference_seg + 
				'{ ' +
					'?link foaf:name ?name . ' +
					'FILTER regex(?name, "' + input + '", "i") ' + 
					'?link rdf:type foaf:Person . ' +
				'}' +
			'}';

	
	$.getJSON("/sparql", {query: $query , format: "json" }, 
		function(json){
			$('#authorsheader').html('Author');
			$.each(json.results.bindings, function(i){
				$('#people').append('<li><a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].name.value + '</a></li>');
			});
		}
	)
}

function findPaper(input, conference){

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
						'FILTER regex(?title, "' + input + '", "i") '+ 
						'?link rdf:type bibo:Chapter . ' +
						'?link dc:date ?year . ' +
					'} ' +
					'UNION ' +
					'{ ' +
						'?link dc:subject key:' + input + ' .' +
						'?link dc:title ?title . ' +
						'?link rdf:type bibo:Chapter . ' +
						'?link dc:date ?year . ' +
					'} ' +		
				'} ' +		 
			'}' + 
			'ORDER BY DESC(?year) ?title';
	//$query = prefixes + 'SELECT ?link ?title { GRAPH ' + conference_seg + ' { ?link dc:partOf (dc:publisher "ACM" 10) } }';

	$.getJSON("/sparql", {query: $query , format: "json" },
		function(json){
			$('#papersheader').html('Paper');
			$.each(json.results.bindings, function(i){
				$('#papers').append('<li>(' + json.results.bindings[i].year.value + ') <a href="' + json.results.bindings[i].link.value + '">' + json.results.bindings[i].title.value + '</a></li>');
			}); 
		}
	)
}

function initialize(){
	if($.urlParam('input') != 0){
		findAuthor($.urlParam('input').replace(/\+/g," "), $.urlParam('conference'));
		findPaper($.urlParam('input').replace(/\+/g," "), $.urlParam('conference'));
	}
	

};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    } else {
       return results[1] || 0;
    }
}

