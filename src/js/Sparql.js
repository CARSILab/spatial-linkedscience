const Sparql = (function () {

  const infoIcon = '<svg class="icon icon-info"><use xlink:href="#icon-info_outline" /></svg>';

  const types = {
    person: 'http://xmlns.com/foaf/0.1/Person',
    paper: 'http://purl.org/ontology/bibo/Chapter',
    affiliation: 'http://xmlns.com/foaf/0.1/Organization'
  };

  // PRIVATE
  const prefixes = `
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
  const $title = $('.results-title');
  const $peopleHeader = $('.people-header');
  const $paperHeader = $('.paper-header');
  const $peopleList = $('.people-list');
  const $paperList = $('.paper-list');

  // generate SPARQL query strings
  // TODO: allow searches using special characters ie: '+' and '/'
  // TODO: make sure subject search is working
  function searchQuery(input, conference) {
    return `
      ${prefixes}
      SELECT DISTINCT ?type ?link ?name ?year ?latlong
      {
        GRAPH ${conference != 'null' ? `spatial:${conference}` : '?g'}
        {
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get any person matching input
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ?link foaf:name ?name .
              FILTER regex(?name, "${input}", "i")
            ?link foaf:familyName ?lastName .
            ?link rdf:type foaf:Person .
            ?link rdf:type ?type .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get any publication matching input
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ?link dc:title ?name .
              FILTER regex(?name, "${input}", "i")
            ?link dc:date ?year .
            ?link rdf:type bibo:Chapter .
            ?link rdf:type ?type .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get any publication with subject matching input
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ?link dc:subject key:${input.split(' ').join('_')} .
            ?link dc:title ?title .
            ?link dc:date ?year .
            ?link rdf:type bibo:Chapter .
            ?link rdf:type ?type .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get any affiliation matching input
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

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
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get author's name and publications
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ${author}
              foaf:name ?name ;
              foaf:publications ?paper .
            ?paper
              dc:title ?title ;
              dc:date ?year ;
              rdf:type ?type .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get all co-authors / editors of author
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ${author} foaf:knows ?knows .
            ?knows
              foaf:name ?coname ;
              foaf:familyName ?lastName ;
              rdf:type ?type .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get author's affiliations
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

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

    //  get location / affiliation

    return `
      ${prefixes}
      SELECT DISTINCT ?title ?authors ?name ?coauthor ?year ?homepage ?partOf ?subject ?g
      {
        GRAPH ?g
        {
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get paper's title, year, homepage, and conference
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

            ${paper}
              dc:title ?title ;
              dc:date ?year ;
              foaf:homepage ?homepage ;
              dc:partOf ?partOf .
          }
          UNION
          {
            # # # # # # # # # # # # # # # # # # # # # # # # # # #
            # get paper's author and  co-authors / editors
            # # # # # # # # # # # # # # # # # # # # # # # # # # #

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
          # # # # # # # # # # # # # # # # # # # # # # # # # # #
          # get name and location of affiliation
          # # # # # # # # # # # # # # # # # # # # # # # # # # #

          ${affiliation}
            foaf:name ?name ;
            geo:lat_long ?latlong ;
            ADR:ADR ?location .
        }
        UNION
        {
          # # # # # # # # # # # # # # # # # # # # # # # # # # #
          # get all members of affiliation
          # # # # # # # # # # # # # # # # # # # # # # # # # # #

          ${affiliation} foaf:member ?members .
          ?members foaf:name ?name .
        }
      }
      `;
  }

  // Display results to page
  function renderSearch(json, input, conference) {
    const results = json.results.bindings;
    const conference_part = conference != 'null' ? `${conference}` : '';


    // No Results:
    if (results.length === 0) {
      $title.html(`There are no results for <b>${input} ${conference_part}</b>, try searching again.`);
    } else {
      $title.html(`Showing results for: <b>${input} ${conference_part}</b>`);

      $peopleHeader.html('<span class="icon-user">Authors</span>');
      $paperHeader.html('Papers');

      // fill page with data
      $.each(results, function (i) {
        if (results[i].type.value === types.person) {
          $peopleList.append(`
            <li class="author">
              <a href="#${results[i].link.value.slice(41)}">${results[i].name.value}</a>
              &nbsp;
              <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].link.value}">${infoIcon}</a>
            </li>
          `);
        } else if (results[i].type.value === types.paper) {
          $paperList.append(`
            <li class="paper">(${results[i].year.value})
              <a href="#${results[i].link.value.slice(41)}"> ${results[i].name.value}</a>
              &nbsp;
              <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].link.value}">&rarr;</a>
            </li>
          `);
        } else if (results[i].type.value === types.affiliation) {
          Map.setAffiliation(results[i]);
        }
      });
    }
  }

  function renderAuthor(json) {
    const results = json.results.bindings;


    $title.html('<b>' + results[0].name.value + '</b>');
    $paperHeader.html('Papers');
    $peopleHeader.html('Co-authors/-editors');

    // Map.setAuthorPins(results.filter(result => result.type.value === 'http://xmlns.com/foaf/0.1/Organization'));

    $.each(results, function (i) {
      if (results[i].type.value === types.paper) {
        $paperList.append(`
          <li class="paper">(${results[i].year.value})
            <a href="#${results[i].paper.value.slice(41)}">${results[i].title.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].paper.value}">&rarr;</a>
          </li>
        `);
      } else if (results[i].type.value === types.person) {
        $peopleList.append(`
          <li class="author">
            <a href="#${results[i].knows.value.slice(41)}">${results[i].coname.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].knows.value}">&rarr;</a>
          </li>
        `);
      } else if (results[i].type.value === types.affiliation) {
        // Map.setAffiliation(results[i]);
      }
    });
  }

  function renderPaper(json) {

    var results = json.results.bindings;


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
            <a href="#${results[i].coauthor.value.slice(41)}">${results[i].name.value}</a>
            &nbsp;
            <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].coauthor.value}>&rarr;</a>
          </li>
        `);
      }
    });
  }

  function renderAffiliation(json) {
    var results = json.results.bindings;
    // console.log(results);

    Map.setAffiliation(results[0]);
    Map.zoomTo(results[0].latlong.value);

    $title.html(`<strong>${results[0].name.value}</strong>`);
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

  function selectAuthor(input) {
    $.getJSON('/sparql', {
      query: authorQuery(input),
      format: 'json'
    }, function (json) {
      renderAuthor(json);
    });
  }

  function selectPaper(input) {
    $.getJSON('/sparql', {
      query: paperQuery(input),
      format: 'json'
    }, function (json) {
      renderPaper(json);
    });
  }

  function selectAffiliation(input) {
    $.getJSON('/sparql', {
      query: affiliationQuery(input),
      format: 'json'
    }, function (json) {
      renderAffiliation(json);
    });
  }

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
