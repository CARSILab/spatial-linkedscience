const Router = (function () {

  // Checks hash and calls appropriate function
  function checkHash(){

    const hash = window.location.hash.slice(1);
    const uri = `<http://spatial.linkedscience.org/context/${hash}>`;

    if (hash.match(/^search/)) {
      const key = decodeURIComponent(hash.match(/key=([^&]+)/)[1].replace(/\+/g, ' '));
      const conf = hash.match(/conf=([^&]+)/)[1];
      Sparql.search(key, conf);

    } else if (hash.match(/^person/)) {
      Sparql.selectAuthor(uri);

    } else if (hash.match(/^affiliation/)) {
      Sparql.selectAffiliation(uri);

    } else if (hash.match(/\/paper\//)){
      Sparql.selectPaper(uri);

    } else {
      Dom.slide('left');
    }

  }

  // Add event listener to window that will call checkHash whenever the hash is changed
  $(() => {
    checkHash();
    window.addEventListener('hashchange', checkHash);
  });

  // Public Methods
  return {

  };

})();
