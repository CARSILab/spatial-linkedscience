const Router = (function () {
  'use strict';

  // Checks hash and calls appropriate function
  function checkHash(){

    const hash = window.location.hash.slice(1);
    const uri = `<http://spatial.linkedscience.org/context/${hash}>`;

    if (hash.match(/^search/)) {
      const key = decodeURIComponent(hash.match(/key=([^&]+)/)[1].replace(/\+/g, ' '));
      const conf = hash.match(/conf=([^&]+)/)[1];

      Dom.slide('right');
      App.search(key, conf);

    } else if (hash.match(/^person/)) {
      Dom.slide('right');
      App.selectAuthor(uri);

    } else if (hash.match(/^affiliation/)) {
      Dom.slide('right');
      App.selectAffiliation(uri);

    } else if (hash.match(/\/paper\//)){
      Dom.slide('right');
      App.selectPaper(uri);

    } else {
      Dom.slide('left');
    }

  }

  // Add event listener to window that will call checkHash whenever the hash is changed
  $(function() {
    checkHash();
    window.addEventListener('hashchange', checkHash);
  });

  // Public Methods
  return {

  };

})();
