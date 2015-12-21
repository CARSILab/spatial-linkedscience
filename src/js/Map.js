var Map = (function () {

  // PRIVATE
  var markers = [];
  var pin = L.icon({
    iconUrl: 'assets/icons/circle.png',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
  var map = createMap();

  function createMap(center) {
    if (!center) {
      if ($(window).width() < 700) {
        center = [40, -95]; // center on USA
      } else {
        center = [22, -7]; // center between North America and Europe
      }
    }
    return L.map('map', {
      center: center,
      zoom: 2,
      scrollWheelZoom: false
    });
  }

  // might need to doc ready this
  L.tileLayer(
    'http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
      attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>'
    }).addTo(map);

  // CREATE MAP PIN
  function setPin(data) {
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
      Poll.setHash('<' + data.link.value + '>');
    });

    // push marker into array (for later deletion)
    markers.push(marker);
  }

  return {
    // API
    setPin: setPin
  };
})();
