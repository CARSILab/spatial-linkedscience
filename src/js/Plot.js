import $ from 'jquery'
import Leaflet from 'leaflet'
import 'leaflet.arc'

// Instantiates a map object
var center = window.innerWidth < 700 ? [40, -95] : [22, -7]
var map = Leaflet.map('map', {
  center: center,
  zoom: 2,
  scrollWheelZoom: true,
  attributionControl: false
})

Leaflet.control.attribution({position: 'topright'}).addTo(map);

// Load and display tile layers on the map
Leaflet.tileLayer(
  'http://a.tiles.mapbox.com/v4/amaldare93.mbpl53l0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW1hbGRhcmU5MyIsImEiOiJGdEFlcHpZIn0.0WX3tspKb0IXCJbdGMLmNQ', {
    attribution: 'Map tiles by <a href="https://www.mapbox.com/">Mapbox</a>'
  }).addTo(map)

// Icon class for rendering a marker
var pin = Leaflet.icon({
  iconUrl: 'icons/icon-dot_solid.svg',
  iconSize: [15, 15],
  // iconAnchor: [10, 20],
  className: 'map-marker'
})

var markers = []
var polyline

// CREATE MAP PIN FOR AN AFFILIATION
function setAffiliation (data) {
  // extract lat and long
  var latlong = data.latlong.value.split(' ').map(parseFloat)

  // create map marker
  var marker = Leaflet.marker(
    latlong, {
      icon: pin,
      title: data.name.value
    }).addTo(map)

  // selectAffiliation
  $(marker).on('click', function () {
    window.location.hash = data.link.value.slice(41)
  })

  // push marker into array (for later deletion)
  markers.push(marker)
}

// CREATE MAP PINS FOR AN AUTHOR
function setAuthorPins (data) {
  // For Each affiliation
  data.forEach(function (item, index, arr) {
    // extract lat and long
    var latlong = item.latlong.value.split(' ').map((val) => parseFloat(val))
    // create map marker
    markers.push(
      Leaflet.marker(latlong, {
        icon: pin,
        title: item.name.value
      })
      .on('click', function () {
        window.location.hash = item.affiliation.value.slice(41)
      })
      .addTo(map)
    )

    // Create Polyline
    if (index === 1) {
      let start = arr[0].latlong.value.split(' ').map((val) => parseFloat(val))
      polyline = Leaflet.Polyline.Arc(start, latlong, {
        color: '#EC5F67',
        opacity: 1
      }).addTo(map)
    }
    if (index > 1) {
      polyline.addLatLng(latlong)
    }
  })

  // Zoom into markers
  if (polyline) {
    map.fitBounds(polyline.getBounds(), {
      padding: [50, 50],
      animate: true
    })
  } else {
    map.setView(
      markers[0].getLatLng(), 10, {
        animate: true
      }
    )
  }
}

function zoomTo (latlong) {
  map.setView(
    latlong.split(' ').map(parseFloat), 10, {
      animate: true
    }
  )
}

function clearLayers () {
  if (polyline) {
    map.removeLayer(polyline)
    polyline = null
  }
  markers.forEach(function (marker) {
    map.removeLayer(marker)
  })
  markers.length = 0
}

function resetMap () {
  clearLayers()
  map.setView(center, 2)
}

export { resetMap }
export default {
  setAffiliation,
  setAuthorPins,
  zoomTo,
  resetMap
}
