var Router = (function () {

  function setHash(hash) {
    window.location.hash = hash.slice(42, -1);
  }

  // checks hash and loads page accordingly
  function checkHash(){

    var hash = window.location.hash.slice(1);
    var key = `<http://spatial.linkedscience.org/context/${hash}>`;
    console.log(hash);
    if (hash.length < 2) {
      Dom.clear();
    } else if (hash.match(/^search/)) {
      Sparql.search();
    } else if (hash.match(/^person/)) {
      Sparql.selectAuthor(key);
    } else if (hash.match(/^affiliation/)) {
      Sparql.selectAffiliation(key);
    } else if (hash.match(/\/paper\//)){
      Sparql.selectPaper(key);
    }

  }

  $(document).ready(function () {

    checkHash();
    window.addEventListener('hashchange', checkHash);

  });

  return {
    setHash: setHash
  };

})();
