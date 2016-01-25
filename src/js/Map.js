var Map = (function () {

  // Instantiates a map object
  const center = $(window).width() < 700 ? [40, -95] : [22, -7];
  const map = L.map('map', {
    center: center,
    zoom: 2,
    scrollWheelZoom: true
  });

  // Icon class for rendering a marker
  const pin = L.icon({
    iconUrl: 'icons/place.svg',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    className: 'map-marker'
  });


  let markers = [];

  // Load and display tile layers on the map
  L.tileLayer(
    'http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
    attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>'
  }).addTo(map);



  // CREATE MAP PIN FOR AN AFFILIATION
  function setAffiliation(data) {

    // extract lat and long
    const latlong = data.latlong.value.split(' ').map(parseFloat);

    // create map marker
    const marker = L.marker(
      latlong, {
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
    // extract lat and long
    var latlong = data.latlong.value.split(' ');
    // create map marker
    var marker = L.marker(
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

  function zoomTo(latlong){
    map.setView(
      latlong.split(' ').map(parseFloat), 10, {
        animate: true
      }
    );
  }

  function clearPins(){
    markers.forEach((marker) => {
      map.removeLayer(marker);
    });
    markers.length = 0;
  }

  function resetMap(){
    clearPins();
    map.setView(center, 2);
  }

  return {
    // API
    setAffiliation,
    setAuthorPins,
    zoomTo,
    resetMap
  };
})();
