var Poll = (function () {

  var lastHash = '';

  // checks hash and loads page accordingly
  function pollHash() {
    if (window.location.hash != lastHash) {
      lastHash = window.location.hash;
      var key = '<http://spatial.linkedscience.org/context/' + lastHash.slice(1) + '>';

      $('.belt').css('left', '-100%');
      if (lastHash.length < 2) {
        Dom.clear();
      } else if (lastHash[1] == 'p') {
        Sparql.selectAuthor(key);
      } else if (lastHash[2] == 'f') {
        Sparql.selectAffiliation(key);
      } else {
        Sparql.selectPaper(key);
      }
    }
  }

  function setHash(hash) {
    window.location.hash = hash.slice(42, -1);
  }

  $(document).ready(function () {

    pollHash();
    setInterval(pollHash, 10);

  });

  return {
    pollHash: pollHash,
    setHash: setHash
  };

})();
