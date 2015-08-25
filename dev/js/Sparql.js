// Custom module for making SPARQL queries
var Sparql = (function(){

  // PRIVATE
  var prefixes = 'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> prefix dc: <http://purl.org/dc/terms/> prefix bibo: <http://purl.org/ontology/bibo/> prefix foaf: <http://xmlns.com/foaf/0.1/> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix spatial: <http://spatial.linkedscience.org/context/> prefix key: <http://spatial.linkedscience.org/context/keyword/> prefix ADR: <http://www.w3.org/2001/vcard-rdf/3.0#> ';

  // DOM CACHING
  var $title = $('.title'),
      $peopleHeader = $('.people-header'),
      $paperHeader = $('.paper-header'),
      $peopleList = $(".people-list"),
      $paperList = $('.paper-list');

  // Sample JSONs
  var sampleAuthor = {
        "results": {
          "bindings": {
            "0": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "A Day in the Life of John: John Walks his Dog in Public"
              },
              "year": {
                "value": "2011"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "1": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "A Day in the Life of John Part Two: Electric Boogaloo"
              },
              "year": {
                "value": "2012"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "2": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "2 John 2 Furious: The story of Two Smiths"
              },
              "year": {
                "value": "2013"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "3": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "John Smith: Tokyo Drift or 'How Johnny Met Sally'"
              },
              "year": {
                "value": "2014"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "4": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "Smith Five: The Raiders of The Lost Arc"
              },
              "year": {
                "value": "2015"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "5": {
              "name": {
                "value": "John Smith"
              },
              "paper": {
                "value": "#"
              },
              "title": {
                "value": "John Smith and The Deathly Hallows: Part 6"
              },
              "year": {
                "value": "2016"
              },
              "type": {
                "value": "http://purl.org/ontology/bibo/Chapter"
              }
            },
            "6": {
              "coname": {
                "value": "Adam West"
              },
              "knows": {
                "value": "#"
              },
              "lastName": {
                "value": "West"
              },
              "type": {
                "value": "http://xmlns.com/foaf/0.1/Person"
              }
            },
            "7": {
              "coname": {
                "value": "Tyreece Williams"
              },
              "knows": {
                "value": "#"
              },
              "lastName": {
                "value": "Williams"
              },
              "type": {
                "value": "http://xmlns.com/foaf/0.1/Person"
              }
            },
            "8": {
              "coname": {
                "value": "People Person"
              },
              "knows": {
                "value": "#"
              },
              "lastName": {
                "value": "Person"
              },
              "type": {
                "value": "http://xmlns.com/foaf/0.1/Person"
              }
            },
            "9": {
              "coname": {
                "value": "Tony Pajamas"
              },
              "knows": {
                "value": "#"
              },
              "lastName": {
                "value": "Pajamas"
              },
              "type": {
                "value": "http://xmlns.com/foaf/0.1/Person"
              }
            },

          }
        }
      },
      samplePaper = {
        "results": {
          "bindings": {
            "0": {
              "title": {
                "value": "Bill and Ted's Excellent Adventure"
              },
              "year": {
                "value": "1986"
              },
              "homepage": {
                "value": "#"
              },
              "partOf": {
                "value": "AGILE"
              }
            },
            "1": {
              "name": {
                "value": "John Hamm"
              },
              "coauthor": {
                "value": "#"
              }
            },


          }
        }
      };



  // generate SPARQL query strings
  function searchQuery(input, conference){
    var conference_seg = conference != 'null' ? 'spatial:' + conference :'?g';
    return prefixes +
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
  }

  function authorQuery(author){
    return prefixes +
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
  }

  function paperQuery(paper){
    return prefixes +
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
  }

  function affiliationQuery(affiliation){
    return prefixes +
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
  }

  // Display results to page
  function renderSearch(json, input, conference){
    console.log('rendering');
    var results = json.results.bindings,
        conference_part = conference != 'null' ? ' >> ' + conference : '';

    // No Results:
    if(results.length === 0)
    {
      $title.html('There are no results for <b>' + input + conference_part + '</b>, try searching again.');
    }
    else
    {
      $title.html('Showing results for: <b>' + input + conference_part + '</b>');


      $peopleHeader.html('<span class="icon-user">Authors</span>');
      $paperHeader.html('Papers');

      // fill page with data
      $.each(results, function(i){
        if( results[i].type.value == 'http://xmlns.com/foaf/0.1/Person' )
        {
          $peopleList.append('<li class="author"><a href="javascript:setHash(\'<' + results[i].link.value + '>\')">' + results[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this author" href="' + results[i].link.value + '">&rarr;</a></li>');
        }
        else if( results[i].type.value == 'http://purl.org/ontology/bibo/Chapter' )
        {
          $paperList.append('<li class="paper">(' + results[i].year.value + ') <a href="javascript:setHash(\'<' + results[i].link.value + '>\')">' + results[i].name.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + results[i].link.value + '">&rarr;</a></li>');
        }
        else if( results[i].type.value == 'http://xmlns.com/foaf/0.1/Organization' )
        {
          setPin(results[i]);
        }
      });
    }
  }

  function renderAuthor(json){
    var results = json.results.bindings;
    clear();
    $title.html('<b>' + results[0].name.value + '</b>');
    $paperHeader.html('Papers');
    $peopleHeader.html('Co-authors/-editors');

    $.each(results, function(i){
      if( results[i].type.value == 'http://purl.org/ontology/bibo/Chapter')
      {
        $paperList.append('<li class="paper">(' + results[i].year.value + ') <a href="javascript:setHash(\'<' + results[i].paper.value + '>\')">' + results[i].title.value + '</a>&nbsp;<a class="rawdata" target="_blank" title="Raw data for this paper" href="' + results[i].paper.value + '">&rarr;</a></li>');
      }
      else if ( results[i].type.value == 'http://xmlns.com/foaf/0.1/Person')
      {
        $peopleList.append("<li class='author'><a href='javascript:setHash(\"<" + results[i].knows.value + ">\")'>" + results[i].coname.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + results[i].knows.value + "'>&rarr;</a></li>");
      }
      else if ( results[i].type.value == 'http://xmlns.com/foaf/0.1/Organization')
      {
        setPin(results[i]);
      }
    });
  }

  function renderPaper(json){
    console.log(json);

    var results = json.results.bindings;
    clear();

    $title.html('<b>' + results[0].title.value + '</b>');
    $peopleHeader.html('Authors/Co-authors');
    $paperHeader.html('Paper Info');


    $paperList.append('<li><b>Year</b>: ' + results[0].year.value + '</li>');
    $paperList.append('<li><b>Homepage</b>: <a href="' + results[0].homepage.value + '">here</a></li>');
    $paperList.append('<li><b>Part Of</b>: ' + results[0].partOf.value + '</li>');


    $.each(results, function(i){
      if(i !== 0){
        $peopleList.append("<li class='author'><a href='javascript:setHash(\"<" + results[i].coauthor.value + ">\")'>" + results[i].name.value + "</a>&nbsp;<a class='rawdata' target='_blank' title='Raw data for this author' href='" + results[i].coauthor.value + "'>&rarr;</a></li>");
      }
    });
  }

  function renderAffiliation(json){
    var results = json.results.bindings;
    clear();

    var data = results;
    $title.html('<strong>' + data[0].name.value + '</strong>');
    $peopleHeader.html('Members');
    $paperHeader.html('Affiliation Info');

    $paperList.append();
    $paperList.append();
    $paperList.append();
    $paperList.append();
  }

  // Public
  function search(input, conference){
    $.getJSON('/sparql', {query: searchQuery(input, conference), format: 'json'}, function(json){
      renderSearch(json, input, conference);
    });
  }

  function selectAuthor(input, conference){
    $.getJSON('/sparql', {query: authorQuery(input, conference), format: 'json'}, function(json){
      renderAuthor(json);
    });
  }

  function selectPaper(input, conference){
    $.getJSON('/sparql', {query: paperQuery(input, conference), format: 'json'}, function(json){
      renderPaper(json);
    });
  }

  function selectAffiliation(input, conference){
    $.getJSON('/sparql', {query: affiliationQuery(input, conference), format: 'json'}, function(json){
      renderAffiliation(json);
    });
  }

  // Render Offline Test Data
  function testSearch(){
    $('.belt').css('left', '-100%');
    renderSearch(sampleSearch);
  }
  function testAuthor(){
    $('.belt').css('left', '-100%');
    renderAuthor(sampleAuthor);
  }
  function testPaper(){
    $('.belt').css('left', '-100%');
    renderPaper(samplePaper);
  }
  function testAffiliation(){
    $('.belt').css('left', '-100%');
    renderAffiliation(sampleAffiliation);
  }

  return {
    // API
    search: search,
    selectAuthor: selectAuthor,
    selectPaper: selectPaper,
    selectAffiliation: selectAffiliation,

    // Testing
    testSearch: testSearch,
    testAuthor: testAuthor,
    testPaper: testPaper,
    testAffiliation: testAffiliation
  };
})();
// end
