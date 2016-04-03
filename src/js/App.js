const App = (function() {
  'use strict';

  const types = {
    person: 'http://xmlns.com/foaf/0.1/Person',
    paper: 'http://purl.org/ontology/bibo/Chapter',
    affiliation: 'http://xmlns.com/foaf/0.1/Organization'
  };


  // DOM CACHING
  const $title = $('.results-title');
  const $peopleHeader = $('.people-header');
  const $paperHeader = $('.papers-header');
  const $peopleList = $('.people-list');
  const $paperList = $('.papers-list');


  // Display results to page
  function renderSearch(json, input, conference) {
    const results = json.results.bindings;
    const conference_part = conference != 'null' ? `${conference}` : '';


    // No Results:
    if (results.length === 0) {
      $title.html(`There are no results for ${input} ${conference_part}, try searching again.`);
    } else {
      $title.html(`Showing results for: ${input} ${conference_part}`);

      $peopleHeader.html(`${Template.icons.person} Authors`);
      $paperHeader.html(`${Template.icons.paper} Papers`);

      // fill page with data
      $.each(results, function (i, result) {
        if (result.type.value === types.person) {
          $peopleList.append(Template.author.render({
            shortLink: result.link.value.slice(41),
            link: result.link.value,
            name: result.name.value
          }));
        } else if (result.type.value === types.paper) {
          $paperList.append(Template.paper.render({
            shortLink: result.link.value.slice(41),
            link: result.link.value,
            name: result.name.value,
            year: result.year.value
          }));
        } else if (result.type.value === types.affiliation) {
          Map.setAffiliation(result);
        }
      });
    }
  }

  function renderAuthor(json) {
    const results = json.results.bindings;


    $title.html(results[0].name.value);
    $peopleHeader.html(`${Template.icons.people} Co-authors / -editors`);
    $paperHeader.html(`${Template.icons.paper} Papers`);

    // Map.setAuthorPins(results.filter(result => result.type.value === 'http://xmlns.com/foaf/0.1/Organization'));

    $.each(results, function (i, result) {
      if (result.type.value === types.paper) {
        $paperList.append(Template.paper.render({
          shortLink: result.paper.value.slice(41),
          link: result.paper.value,
          name: result.title.value,
          year: result.year.value
        }));
      } else if (result.type.value === types.person) {
        $peopleList.append(Template.author.render({
          shortLink: result.knows.value.slice(41),
          link: result.knows.value,
          name: result.coname.value
        }));
      } else if (result.type.value === types.affiliation) {
        // Map.setAffiliation(result);
      }
    });
  }

  function renderPaper(json) {

    var results = json.results.bindings;


    $title.html(results[0].title.value);
    $peopleHeader.html('Authors/Co-authors');
    $paperHeader.html('Paper Info');

    $paperList.append(Template.paperInfo.render({
      year: results[0].year.value,
      homepage: results[0].homepage.value,
      conference: results[0].partOf.value
    }));

    $.each(results, function (i, result) {
      if (i > 0) {
        $peopleList.append(Template.author.render({
          shortLink: result.coauthor.value.slice(41),
          link: result.coauthor.value,
          name: result.name.value
        }));
      }
    });
  }

  function renderAffiliation(json) {
    var results = json.results.bindings;
    // console.log(results);

    Map.setAffiliation(results[0]);
    Map.zoomTo(results[0].latlong.value);

    $title.html(results[0].name.value);
    $peopleHeader.html('Members');
    $paperHeader.html('Affiliation Info');

  }

  // Public
  // TODO: refactor into one func with params for diff searches
  // function getStuff(type, input)
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
