var Router = (function () {

  function setHash(hash) {
    window.location.hash = hash.slice(42, -1);
  }

  // checks hash and loads page accordingly
  function checkHash(){

    var hash = window.location.hash.slice(1);
    var key = `<http://spatial.linkedscience.org/context/${hash}>`;

    if (hash.length < 2) {
      Dom.clear();
    } else if (hash[0] === 'p') {
      Sparql.selectAuthor(key);
    } else if (hash[1] === 'f') {
      Sparql.selectAffiliation(key);
    } else {
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
