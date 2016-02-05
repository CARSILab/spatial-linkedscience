const App = (function() {

  const icons = {
    info: '<svg class="icon icon-info"><use xlink:href="#icon-info_outline" /></svg>',
    paper: '<svg class="icon icon-paper"><use xlink:href="#icon-paper" /></svg>',
    person: '<svg class="icon icon-person"><use xlink:href="#icon-person" /></svg>',
    people: '<svg class="icon icon-people"><use xlink:href="#icon-people" /></svg>',
    place: '<svg class="icon icon-place"><use xlink:href="#icon-place" /></svg>',
    school: '<svg class="icon icon-school"><use xlink:href="#icon-school" /></svg>'
  };

  const types = {
    person: 'http://xmlns.com/foaf/0.1/Person',
    paper: 'http://purl.org/ontology/bibo/Chapter',
    affiliation: 'http://xmlns.com/foaf/0.1/Organization'
  };


  // DOM CACHING
  const $title = $('.results-title');
  const $peopleHeader = $('.people-header');
  const $paperHeader = $('.paper-header');
  const $peopleList = $('.people-list');
  const $paperList = $('.paper-list');


  // Display results to page
  function renderSearch(json, input, conference) {
    const results = json.results.bindings;
    const conference_part = conference != 'null' ? `${conference}` : '';


    // No Results:
    if (results.length === 0) {
      $title.html(`There are no results for <b>${input} ${conference_part}</b>, try searching again.`);
    } else {
      $title.html(`Showing results for: <b>${input} ${conference_part}</b>`);

      $peopleHeader.html(`${icons.person} Authors`);
      $paperHeader.html(`${icons.paper} Papers`);

      // fill page with data
      $.each(results, function (i) {
        if (results[i].type.value === types.person) {
          $peopleList.append(`
            <li class="list-group-item author">
              <a href="#${results[i].link.value.slice(41)}">${results[i].name.value}</a>
              <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].link.value}">${icons.info}</a>
            </li>
          `);
        } else if (results[i].type.value === types.paper) {
          $paperList.append(`
            <li class="list-group-item paper">(${results[i].year.value})
              <a href="#${results[i].link.value.slice(41)}"> ${results[i].name.value}</a>
              <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].link.value}">${icons.info}</a>
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
    $peopleHeader.html(`${icons.people} Co-authors / -editors`);
    $paperHeader.html(`${icons.paper} Papers`);

    // Map.setAuthorPins(results.filter(result => result.type.value === 'http://xmlns.com/foaf/0.1/Organization'));

    $.each(results, function (i) {
      if (results[i].type.value === types.paper) {
        $paperList.append(`
          <li class="list-group-item paper">(${results[i].year.value})
            <a href="#${results[i].paper.value.slice(41)}">${results[i].title.value}</a
            <a class="rawdata" target="_blank" title="Raw data for this paper" href="${results[i].paper.value}">${icons.info}</a>
          </li>
        `);
      } else if (results[i].type.value === types.person) {
        $peopleList.append(`
          <li class="list-group-item author">
            <a href="#${results[i].knows.value.slice(41)}">${results[i].coname.value}</a
            <a class="rawdata" target="_blank" title="Raw data for this author" href="${results[i].knows.value}">${icons.info}</a>
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
          <li class="list-group-item author">
            <a href="#${results[i].coauthor.value.slice(41)}">${results[i].name.value}</a
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
      query: Sparql.searchQuery(input, conference),
      format: 'json'
    }, function (json) {
      renderSearch(json, input, conference);
    });
  }

  function selectAuthor(input) {
    $.getJSON('/sparql', {
      query: Sparql.authorQuery(input),
      format: 'json'
    }, function (json) {
      renderAuthor(json);
    });
  }

  function selectPaper(input) {
    $.getJSON('/sparql', {
      query: Sparql.paperQuery(input),
      format: 'json'
    }, function (json) {
      renderPaper(json);
    });
  }

  function selectAffiliation(input) {
    $.getJSON('/sparql', {
      query: Sparql.affiliationQuery(input),
      format: 'json'
    }, function (json) {
      renderAffiliation(json);
    });
  }

  return {
    search,
    selectAuthor,
    selectPaper,
    selectAffiliation
  };




}());
