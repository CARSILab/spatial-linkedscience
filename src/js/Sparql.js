const Sparql = (function () {

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


  return {
    searchQuery,
    authorQuery,
    paperQuery,
    affiliationQuery
  };
})();
