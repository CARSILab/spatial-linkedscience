var testObject = {'book': {'name': 'hello'}};

var Sparql = (function () {

  // gotto be a way to maybe use templating to fill in data instead of jquery appending everything


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
  var $title = $('.results-title');
  var $peopleHeader = $('.people-header');
  var $paperHeader = $('.paper-header');
  var $peopleList = $('.people-list');
  var $paperList = $('.paper-list');

  // generate SPARQL query strings
  function searchQuery(input, conference) {
    var conference_seg = conference != 'null' ? `spatial:${conference}` : '?g';

    return `
      ${prefixes}
      SELECT DISTINCT ?type ?link ?name ?year ?latlong
      {
        GRAPH ${conference_seg}
        {
          {
            ?link foaf:name ?name .
              FILTER regex(?name, "${input}", "i")
            ?link foaf:familyName ?lastName .
            ?link rdf:type foaf:Person .
            ?link rdf:type ?type .
          }
          UNION
          {
            ?link dc:title ?name .
              FILTER regex(?name, "${input}", "i")
            ?link dc:date ?year .
            ?link rdf:type bibo:Chapter .
            ?link rdf:type ?type .
          }
          UNION
          {
            ?link dc:subject key:${input.split(' ').join('_')} .
            ?link dc:title ?title .
            ?link dc:date ?year .
            ?link rdf:type bibo:Chapter .
            ?link rdf:type ?type .
          }
          UNION
          {
            ?link foaf:name ?name ;
              FILTER regex(?name, "${input}", "i")
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
      ${prefixes}
      SELECT DISTINCT ?name ?paper ?title ?year ?knows ?coname ?type ?affiliation ?latlong
      {
        GRAPH ?g
        {
          {
            ${author}
              foaf:name ?name ;
              foaf:publications ?paper .
            ?paper dc:title ?title .
            ?paper dc:date ?year .
            ?paper rdf:type ?type .
          }
          UNION
          {
            ${author} foaf:knows ?knows .
            ?knows foaf:name ?coname .
            ?knows foaf:familyName ?lastName .
            ?knows rdf:type ?type .
          }
          UNION
          {
            ?affiliation
              foaf:member ${author} ;
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
      ${prefixes}
      SELECT DISTINCT ?title ?authors ?name ?coauthor ?year ?homepage ?partOf ?subject ?g
      {
        GRAPH ?g
        {
          {
            ${paper}
              dc:title ?title ;
              dc:date ?year ;
              foaf:homepage ?homepage ;
              dc:partOf ?partOf .
          }
          UNION
          {
            ${paper} bibo:authorList ?list .
            ?list rdf:rest*/rdf:first ?coauthor .
            ?coauthor foaf:name ?name .
          }
        }
      }
      `;
  }

  function affiliationQuery(affiliation) {
    // TODO: when searching for affiliations, return the locations themselves
    // when selecting an affiliation (which is what this is), return all authors belonging, and all papers written at the place
    return `
      ${prefixes}
      SELECT DISTINCT ?link ?name ?latlong ?location
      {
        {
          ${affiliation}
            foaf:name ?name ;
            geo:lat_long ?latlong ;
            ADR:ADR ?location .
        }
        UNION
        {
          ${affiliation} 'foaf:member ?members .
          ?members foaf:name ?name .
        }
      }
      `;
  }

  // Display results to page
  function renderSearch(json, input, conference) {
    var results = json.results.bindings;
    var conference_part = conference != 'null' ? `${conference}` : '';
    Dom.slide('right');

    // No Results:
    if (results.length === 0) {
      $title.html(`There are no results for <b>${input} >> ${conference_part}</b>, try searching again.`);
    } else {
      $title.html(`Showing results for: <b>${input} >> ${conference_part}</b>`);

      $peopleHeader.html('<span class="icon-user">Authors</span>');
      $paperHeader.html('Papers');

      // fill page with data
      $.each(results, function (i) {
        if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Person') {
          $peopleList.append(`
            <li class="author">
              <a href="javascript:Router.setHash('<${results[i].link.value}>')">${results[i].name.value}</a>
              &nbsp;
              <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].link.value}">&rarr;</a>
            </li>
          `);
        } else if (results[i].type.value == 'http://purl.org/ontology/bibo/Chapter') {
          $paperList.append(`
            <li class="paper">(${results[i].year.value})
              <a href="javascript:Router.setHash('<${results[i].link.value}>')"> ${results[i].name.value}</a>
              &nbsp;
              <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].link.value}">&rarr;</a>
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
    Dom.slide('right');

    $title.html('<b>' + results[0].name.value + '</b>');
    $paperHeader.html('Papers');
    $peopleHeader.html('Co-authors/-editors');

    $.each(results, function (i) {
      if (results[i].type.value == 'http://purl.org/ontology/bibo/Chapter') {
        $paperList.append(`
          <li class="paper">(${results[i].year.value})
            <a href="javascript:Router.setHash('<${results[i].paper.value}>')">${results[i].title.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].paper.value}">&rarr;</a>
          </li>
        `);
      } else if (results[i].type.value == 'http://xmlns.com/foaf/0.1/Person') {
        $peopleList.append(`
          <li class="author">
            <a href="javascript:Router.setHash('<${results[i].knows.value}>')">${results[i].coname.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].knows.value}">&rarr;</a>
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
    Dom.slide('right');

    $title.html('<b>' + results[0].title.value + '</b>');
    $peopleHeader.html('Authors/Co-authors');
    $paperHeader.html('Paper Info');

    $paperList.append(`<li><b>Year</b>: ${results[0].year.value}</li>`);
    $paperList.append(`<li><b>Homepage</b>: <a href="${results[0].homepage.value}">here</a></li>`);
    $paperList.append(`<li><b>Part Of</b>: ${results[0].partOf.value}</li>`);

    $.each(results, function (i) {
      if (i > 0) {
        $peopleList.append(`
          <li class="author">
            <a href="javascript:Router.setHash('<${results[i].coauthor.value}>')">${results[i].name.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].coauthor.value}>&rarr;</a>
          </li>
        `);
      }
    });
  }

  function renderAffiliation(json) {
    var results = json.results.bindings;

    Dom.clear();
    Dom.slide('right');

    var data = results;
    $title.html(`<strong>${data[0].name.value}</strong>`);
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
  // function testSearch() {
  //   $.getJSON('../src/testData/sample-search.json', function (json) {
  //     Dom.slide('right');
  //     renderSearch(json);
  //   });
  // }
  //
  // function testAuthor() {
  //   $.getJSON('../src/testData/sample-author.json', function (json) {
  //     Dom.slide('right');
  //     renderAuthor(json);
  //   });
  // }
  //
  // function testPaper() {
  //   $.getJSON('../src/testData/sample-paper.json', function (json) {
  //     Dom.slide('right');
  //     renderPaper(json);
  //   });
  // }
  //
  // function testAffiliation() {
  //   $.getJSON('../src/testData/sample-affiliation.json', function (json) {
  //     Dom.slide('right');
  //     renderAffiliation(json);
  //   });
  // }

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
        search($text, 'null');
        Dom.clear();
      }
    });

    // bind test functions to buttons
    // $('#testAuthor').click(function (event) {
    //   event.preventDefault();
    //   testAuthor();
    // });
    // $('#testPaper').click(function (event) {
    //   event.preventDefault();
    //   testPaper();
    // });
  });


  return {
    // API
    search: search,
    selectAuthor: selectAuthor,
    selectPaper: selectPaper,
    selectAffiliation: selectAffiliation

    // Testing
  //   testSearch: testSearch,
  //   testAuthor: testAuthor,
  //   testPaper: testPaper,
  //   testAffiliation: testAffiliation
  };
})();
