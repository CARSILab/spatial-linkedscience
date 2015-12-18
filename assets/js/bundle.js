var Dom = (function () {

  // DOM CACHING
  var $title = $('.title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $('.people-list');
  var $paperList = $('.paper-list');
  var $mainSearch = $('#main-search');
  var $navSearch = $('#nav-search');
  var $conference = $('.conference');
  var $belt = $('.belt');

  // clears all data off page
  function clear() {

    $title.empty();
    $peopleHeader.empty();
    $paperHeader.empty();
    $peopleList.empty();
    $paperList.empty();
    $mainSearch.val('');
    $navSearch.val('');
    $conference.text('Conference');
    $conference.attr('data-value', 'null');
    for (var i in Map.markers) {
      Map.removeLayer(Map.markers[i]);
    }
    Map.markers = [];
  }

  function slide(direction) {
    if (direction === 'left') {
      $belt.css('left', '0%');
      window.location.hash = '';
      $navSearch.hide();
    } else if (direction === 'right') {
      $belt.css('left', '-100%');
      $navSearch.show();
    }
  }

  // DOM BINDINGS
  $(document).ready(function () {

    // onclick  for home page
    $('.navbar-brand').click(function () {
      slide('left');
    });

    // dropdown selects
    $(document.body).on('click', '.dropdown-menu li', function (event) {
      //event.preventDefault();
      var $target = $(event.currentTarget);

      $target.closest('.btn-group').find('[data-bind="label"]').text($target.text()).attr('data-value', $target.data('value')).end().children('.dropdown-toggle').dropdown('toggle');
      return false;
    });

    // initially hide navSearch
    $navSearch.hide();
  });

  return {
    clear: clear,
    slide: slide
  };
})();
var Map = (function () {

  // PRIVATE
  var markers = [];
  var pin = L.icon({
    iconUrl: 'assets/icons/circle.png',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
  var map = createMap();

  function createMap(center) {
    if (!center) {
      if ($(window).width() < 700) {
        center = [40, -95]; // center on USA
      } else {
          center = [22, -7]; // center between North America and Europe
        }
    }
    return L.map('map', {
      center: center,
      zoom: 2,
      scrollWheelZoom: false
    });
  }

  // might need to doc ready this
  L.tileLayer('http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
    attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>'
  }).addTo(map);

  // CREATE MAP PIN
  function setPin(data) {
    // extract lat and long
    var latlong = data.latlong.value.split(' ');
    // create map marker
    var marker = L.marker([parseFloat(latlong[0]), parseFloat(latlong[1])], {
      icon: pin,
      title: data.name.value
    }).addTo(map);

    // selectAffiliation
    $(marker).click(function () {
      Poll.setHash('<' + data.link.value + '>');
    });

    // push marker into array (for later deletion)
    markers.push(marker);
  }

  return {
    // API
    setPin: setPin
  };
})();
var Poll = (function () {

  var lastHash = '';

  // checks hash and loads page accordingly
  function pollHash() {
    if (window.location.hash != lastHash) {
      lastHash = window.location.hash;
      var key = '<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>';

      $('.belt').css('left', '-100%');
      if (lastHash.length < 2) {
        Dom.clear();
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

  $(document).ready(function () {

    pollHash();
    setInterval(pollHash, 10);
  });

  return {
    pollHash: pollHash,
    setHash: setHash
  };
})();
var Sparql = (function () {

  // PRIVATE
  var prefixes = `
		prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix dc: <http://purl.org/dc/terms/>
		prefix bibo: <http://purl.org/ontology/bibo/>
		prefix foaf: <http://xmlns.com/foaf/0.1/>
		prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		prefix spatial: <http://spatial.linkedscience.org/context/>
		prefix key: <http://spatial.linkedscience.org/context/keyword/>
		prefix ADR: <http://www.w3.org/2001/vcard-rdf/3.0#>
		`;

  // DOM CACHING
  var $title = $('.title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $('.people-list');
  var $paperList = $('.paper-list');

  // generate SPARQL query strings
  function searchQuery(input, conference) {
    var conference_seg = conference != 'null' ? `spatial: ${ conference }` : '?g';

    return `
			${ prefixes }
			SELECT DISTINCT ?type ?link ?name ?year ?latlong
			{
				GRAPH ${ conference_seg }
				{
					{
						?link foaf:name ?name .
							FILTER regex(?name, "${ input }", "i")
						?link foaf:familyName ?lastName .
						?link rdf:type foaf:Person .
						?link rdf:type ?type .
					}
					UNION
					{
						?link dc:title ?name .
			      	FILTER regex(?name, "${ input }", "i")
			      ?link dc:date ?year .
			      ?link rdf:type bibo:Chapter .
			      ?link rdf:type ?type .
					}
					UNION
					{
						?link dc:subject key:${ input.split(' ').join('_') } .
			      ?link dc:title ?title .
			      ?link dc:date ?year .
			      ?link rdf:type bibo:Chapter .
			      ?link rdf:type ?type .
					}
					UNION
					{
						?link foaf:name ?name ;
							FILTER regex(?name, "${ input }", "i")
						?link geo:lat_long ?latlong .
						?link rdf:type foaf:Organization .
						?link rdf:type ?type .
					}
				}
			}
		`;
  }

  function authorQuery(author) {
    return `
			${ prefixes }
			SELECT DISTINCT ?name ?paper ?title ?year ?knows ?coname ?type ?affiliation ?latlong
			{
				GRAPH ?g
				{
					{
						${ author }
							foaf:name ?name ;
							foaf:publications ?paper .
						?paper dc:title ?title .
						?paper dc:date ?year .
						?paper rdf:type ?type .
					}
					UNION
					{
						${ author } foaf:knows ?knows .
						?knows foaf:name ?coname .
						?knows foaf:familyName ?lastName .
						?knows rdf:type ?type .
					}
					UNION
					{
						?affiliation
							foaf:member ${ author } ;
							foaf:name ?name ;
							geo:lat_long ?latlong ;
							rdf:type ?type .
					}
				}
			}
			ORDER BY DESC(?year) ?title ?lastName
		`;
  }

  function paperQuery(paper) {
    // need to get list of subjects without returning the same paper n times for each subject
    //'dc:subject ?subject ; ' +
    return `
			${ prefixes }
      SELECT DISTINCT ?title ?authors ?name ?coauthor ?year ?homepage ?partOf ?subject ?g
      {
	      GRAPH ?g
	      {
		      {
			      ${ paper }
				      dc:title ?title ;
				      dc:date ?year ;
				      foaf:homepage ?homepage ;
				      dc:partOf ?partOf .
		      }
		      UNION
		      {
			      ${ paper } bibo:authorList ?list .
			      ?list rdf:rest*/rdf:first ?coauthor .
			      ?coauthor foaf:name ?name .
		      }
	      }
      }
			`;
  }

  function affiliationQuery(affiliation) {
    return `
			${ prefixes }
      SELECT DISTINCT ?link ?name ?latlong ?location
      {
	      {
		      ${ affiliation }
			      foaf:name ?name ;
			      geo:lat_long ?latlong ;
			      ADR:ADR ?location .
	      }
	      UNION
	      {
		      ${ affiliation } 'foaf:member ?members .
		      ?members foaf:name ?name .
	      }
      }
			`;
  }

  // Display results to page
  function renderSearch(json, input, conference) {
    var results = json.results.bindings;
    var conference_part = conference != 'null' ? `${ conference }` : '';

    // No Results:
    if (results.length === 0) {
      $title.html(`There are no results for <b>${ input } >> ${ conference_part }</b>, try searching again.`);
    } else {
      $title.html(`Showing results for: <b>${ input } >> ${ conference_part }</b>`);

      $peopleHeader.html('<span class="icon-user">Authors</span>');
      $paperHeader.html('Papers');

      // fill page with data
      $.each(results, function (i) {
        if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Person') {
          $peopleList.append(`
						<li class="list-group-item author">
							<a href="javascript:Poll.setHash('<${ results[i].link.value }>')">${ results[i].name.value }</a>
							&nbsp;
							<a class="rawdata" target="_blank" title="Raw data for this author" href="${ results[i].link.value }">&rarr;</a>
						</li>
					`);
        } else if (results[i].type.value == 'http://purl.org/ontology/bibo/Chapter') {
          $paperList.append(`
						<li class="list-group-item paper">(${ results[i].year.value })
							<a href="javascript:Poll.setHash('<${ results[i].link.value }>')"> ${ results[i].name.value }</a>
							&nbsp;
							<a class="rawdata" target="_blank" title="Raw data for this paper" href="${ results[i].link.value }">&rarr;</a>
						</li>
					`);
        } else if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Organization') {
          Map.setPin(results[i]);
        }
      });
    }
  }

  function renderAuthor(json) {
    var results = json.results.bindings;

    Dom.clear();
    $title.html('<b>' + results[0].name.value + '</b>');
    $paperHeader.html('Papers');
    $peopleHeader.html('Co-authors/-editors');

    $.each(results, function (i) {
      if (results[i].type.value == 'http://purl.org/ontology/bibo/Chapter') {
        $paperList.append(`
					<li class="list-group-item paper">(${ results[i].year.value })
						<a href="javascript:Poll.setHash('<${ results[i].paper.value }>')">${ results[i].title.value }</a>
						&nbsp;
						<a class="rawdata" target="_blank" title="Raw data for this paper" href="${ results[i].paper.value }">&rarr;</a>
					</li>
				`);
      } else if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Person') {
        $peopleList.append(`
					<li class="list-group-item author">
						<a href="javascript:Poll.setHash('<${ results[i].knows.value }>')">${ results[i].coname.value }</a>
						&nbsp;
						<a class="rawdata" target="_blank" title="Raw data for this author" href="${ results[i].knows.value }">&rarr;</a>
					</li>
				`);
      } else if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Organization') {
        Map.setPin(results[i]);
      }
    });
  }

  function renderPaper(json) {

    var results = json.results.bindings;
    Dom.clear();

    $title.html('<b>' + results[0].title.value + '</b>');
    $peopleHeader.html('Authors/Co-authors');
    $paperHeader.html('Paper Info');

    $paperList.append(`<li><b>Year</b>: ${ results[0].year.value }</li>`);
    $paperList.append(`<li><b>Homepage</b>: <a href="${ results[0].homepage.value }">here</a></li>`);
    $paperList.append(`<li><b>Part Of</b>: ${ results[0].partOf.value }</li>`);

    $.each(results, function (i) {
      if (i > 0) {
        $peopleList.append(`
					<li class="list-group-item author">
						<a href="javascript:Poll.setHash('<${ results[i].coauthor.value }>')">${ results[i].name.value }</a>
						&nbsp;
						<a class="rawdata" target="_blank" title="Raw data for this author" href="${ results[i].coauthor.value }>&rarr;</a>
					</li>
				`);
      }
    });
  }

  function renderAffiliation(json) {
    var results = json.results.bindings;
    Dom.clear();

    var data = results;
    $title.html(`<strong>${ data[0].name.value }</strong>`);
    $peopleHeader.html('Members');
    $paperHeader.html('Affiliation Info');

    $paperList.append();
    $paperList.append();
    $paperList.append();
    $paperList.append();
  }

  // Public
  function search(input, conference) {
    $.getJSON('/sparql', {
      query: searchQuery(input, conference),
      format: 'json'
    }, function (json) {
      renderSearch(json, input, conference);
    });
  }

  function selectAuthor(input, conference) {
    $.getJSON('/sparql', {
      query: authorQuery(input, conference),
      format: 'json'
    }, function (json) {
      renderAuthor(json);
    });
  }

  function selectPaper(input, conference) {
    $.getJSON('/sparql', {
      query: paperQuery(input, conference),
      format: 'json'
    }, function (json) {
      renderPaper(json);
    });
  }

  function selectAffiliation(input, conference) {
    $.getJSON('/sparql', {
      query: affiliationQuery(input, conference),
      format: 'json'
    }, function (json) {
      renderAffiliation(json);
    });
  }

  // Render Offline Test Data
  function testSearch() {
    $.getJSON('./dev/testData/sample-search.json', function (json) {
      Dom.slide('right');
      renderSearch(json);
    });
  }

  function testAuthor() {
    $.getJSON('./dev/testData/sample-author.json', function (json) {
      Dom.slide('right');
      renderAuthor(json);
    });
  }

  function testPaper() {
    $.getJSON('./dev/testData/sample-paper.json', function (json) {
      Dom.slide('right');
      renderPaper(json);
    });
  }

  function testAffiliation() {
    $.getJSON('./dev/testData/sample-affiliation.json', function (json) {
      Dom.slide('right');
      renderAffiliation(json);
    });
  }

  // DOM BINDINGS
  $(document).ready(function () {

    // TODO: implement both search bars
    // SEARCH BAR
    $('#main-form').bind('submit', function (event) {
      // stops form submission
      event.preventDefault();

      var $text = $('#main-search').val();
      var $conference = $('.conference').attr('data-value');
      console.log($text);
      if ($text.length > 1) {
        Dom.slide('right');
        search($text, $conference);
        Dom.clear();
      }
    });

    $('#nav-form').bind('submit', function (event) {
      // stops form submission
      event.preventDefault();

      var $text = $('#nav-search').val();
      console.log($text);
      if ($text.length > 1) {
        Dom.slide('right');
        search($text);
        Dom.clear();
      }
    });

    // bind test functions to buttons
    $('#testAuthor').click(function (event) {
      event.preventDefault();
      testAuthor();
    });
    $('#testPaper').click(function (event) {
      event.preventDefault();
      testPaper();
    });
  });

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
//# sourceMappingURL=bundle.js.map