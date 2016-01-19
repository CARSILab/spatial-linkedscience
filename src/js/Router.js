var Router = (function () {

  // Sets the hash string
  // Input: hash (string)
  function setHash(hash) {

    // for search queries
    if(hash.match(/^search/)){
      window.location.hash = hash;

    // for data URIs, will strip off redundant bits at the front
    } else {
      window.location.hash = hash.slice(42, -1);
    }

  }

  // checks hash and calls appropriate function
  function checkHash(){

    var hash = window.location.hash.slice(1);
    var uri = `<http://spatial.linkedscience.org/context/${hash}>`;

    if (hash.length < 3) {
      Dom.clear();
      Dom.slide('left');

    } else if (hash.match(/^search/)) {
      var key = hash.match(/key=([^&]+)/)[1];
      var conf = hash.match(/conf=([^&]+)/)[1];
      Sparql.search(key, conf);

    } else if (hash.match(/^person/)) {
      Sparql.selectAuthor(uri);

    } else if (hash.match(/^affiliation/)) {
      Sparql.selectAffiliation(uri);

    } else if (hash.match(/\/paper\//)){
      Sparql.selectPaper(uri);
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
