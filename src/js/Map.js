var Map = (function () {

  // PRIVATE
  const map = L.map('map', {
    center: $(window).width() < 700 ? [40, -95] : [22, -7],
    zoom: 2,
    scrollWheelZoom: true
  });

  const pin = L.icon({
    iconUrl: 'icons/place.svg',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    className: 'map-marker'
  });

  let markers = [];

  // might need to doc ready this
  L.tileLayer(
    'http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
    attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>'
  }).addTo(map);


  // CREATE MAP PIN FOR AN AFFILIATION
  function setAffiliation(data) {
    console.log(data);
    // extract lat and long
    const latlong = data.latlong.value.split(' ');
    // create map marker
    const marker = L.marker(
      [parseFloat(latlong[0]), parseFloat(latlong[1])], {
        icon: pin,
        title: data.name.value
      }).addTo(map);

    // selectAffiliation
    $(marker).click(function () {
      Router.setHash(data.link.value);
    });

    // push marker into array (for later deletion)
    markers.push(marker);
  }

  // CREATE MAP PINS FOR AN AUTHOR
  function setAuthorPins(data) {
    console.log(data);
    // // extract lat and long
    // var latlong = data.latlong.value.split(' ');
    // // create map marker
    // var marker = L.marker(
    //   [parseFloat(latlong[0]), parseFloat(latlong[1])], {
    //     icon: pin,
    //     title: data.name.value
    //   }).addTo(map);

    // // selectAffiliation
    // $(marker).click(function () {
    //   Router.setHash(data.link.value);
    // });

    // // push marker into array (for later deletion)
    // markers.push(marker);
  }

  return {
    // API
    setAffiliation: setAffiliation,
    setAuthorPins: setAuthorPins
  };
})();
