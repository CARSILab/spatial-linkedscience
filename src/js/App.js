import $ from 'jquery'
import Dom from './Dom'
import Plot from './Plot'
import Sparql from './Sparql'
import Templates from './Templates'

const types = {
  person: 'http://xmlns.com/foaf/0.1/Person',
  paper: 'http://purl.org/ontology/bibo/Chapter',
  affiliation: 'http://xmlns.com/foaf/0.1/Organization'
}

// DOM CACHING
const $title = $('.results-title')
const $peopleHeader = $('.people-header')
const $paperHeader = $('.papers-header')
const $peopleList = $('.people-list')
const $paperList = $('.papers-list')

// Display results to page
function renderSearch (json, input, conference) {
  const results = json.results.bindings
  const conference_part = conference !== 'null' ? `${conference}` : ''

  // No Results:
  if (results.length === 0) {
    $title.html(`There are no results for ${decodeURIComponent(input)} ${conference_part}, try searching again.`)
  } else {
    $title.html(`Showing results for: ${decodeURIComponent(input)} ${conference_part}`)
    $peopleHeader.html(`${Templates.icons.person} Authors`)
    $paperHeader.html(`${Templates.icons.paper} Papers`)

    // fill page with data
    $.each(results, function (i, result) {
      if (result.type.value === types.person) {
        $peopleList.append(Templates.author.render({
          shortLink: result.link.value.slice(41),
          link: result.link.value,
          name: result.name.value
        }))
      } else if (result.type.value === types.paper) {
        $paperList.append(Templates.paper.render({
          shortLink: result.link.value.slice(41),
          link: result.link.value,
          name: result.name.value,
          year: result.year.value
        }))
      } else if (result.type.value === types.affiliation) {
        Plot.setAffiliation(result)
      }
    })
  }
}

function renderAuthor (json) {
  const results = json.results.bindings
  const affiliations = []

  $title.html(results[0].name.value)
  $peopleHeader.html(`${Templates.icons.people} Co-authors / -editors`)
  $paperHeader.html(`${Templates.icons.paper} Papers`)

  $.each(results, function (i, result) {
    if (result.type.value === types.paper) {
      $paperList.append(Templates.paper.render({
        shortLink: result.paper.value.slice(41),
        link: result.paper.value,
        name: result.title.value,
        year: result.year.value
      }))
    } else if (result.type.value === types.person) {
      $peopleList.append(Templates.author.render({
        shortLink: result.knows.value.slice(41),
        link: result.knows.value,
        name: result.coname.value
      }))
    } else if (result.type.value === types.affiliation) {
      affiliations.push(result)
    }
  })
  Plot.setAuthorPins(affiliations)
}

function renderPaper (json) {
  var results = json.results.bindings

  $title.html(results[0].title.value)
  $peopleHeader.html('Authors/Co-authors')
  $paperHeader.html('Paper Info')

  $paperList.append(Templates.paperInfo.render({
    year: results[0].year.value,
    homepage: results[0].homepage.value,
    conference: results[0].partOf.value
  }))

  $.each(results, function (i, result) {
    if (i > 0) {
      $peopleList.append(Templates.author.render({
        shortLink: result.coauthor.value.slice(41),
        link: result.coauthor.value,
        name: result.name.value
      }))
    }
  })
}

function renderAffiliation (json) {
  var results = json.results.bindings

  Plot.setAffiliation(results[0])
  Plot.zoomTo(results[0].latlong.value)

  $title.html(results[0].name.value)
  $peopleHeader.html('Members')
  $paperHeader.html('Affiliation Info')
}

const funcKey = {
  author: {
    query: Sparql.authorQuery,
    render: renderAuthor
  },
  paper: {
    query: Sparql.paperQuery,
    render: renderPaper
  },
  affiliation: {
    query: Sparql.affiliationQuery,
    render: renderAffiliation
  }
}
// Public
function search (input, conference) {
  Dom.slide('right')
  Dom.startLoad()
  $.getJSON('/sparql', {
    query: Sparql.searchQuery(input, conference),
    format: 'json'
  }, function (json) {
    renderSearch(json, input, conference)
    Dom.hideEmpty()
    Dom.stopLoad()
  })
}
function select (type, input) {
  Dom.slide('right')
  Dom.startLoad()
  $.getJSON('/sparql', {
    query: funcKey[type].query(input),
    format: 'json'
  }, function (json) {
    funcKey[type].render(json)
    Dom.hideEmpty()
    Dom.stopLoad()
  })
}

export default {
  search,
  select
}
