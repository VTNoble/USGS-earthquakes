// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place} | Magnitude: ${feature.properties.mag}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {

    // use pointToLayer to create circle markers for each earthquake
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        fillOpacity: 1,
        color: "black",
        weight: 0.5,
        fillColor: markerColor(feature.geometry.coordinates[2]),
        radius: markerSize(feature.properties.mag)
      });
    },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // add legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
      labels = [],
      categories = [-10, 10, 30, 50, 70, 90];

    for (var i = 0; i < categories.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(categories[i] + 1) + '"></i> ' + categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + ' km<br>' : '+ km');
    }
    
    return div;
  };

  legend.addTo(myMap);

}




// A function to determine the marker size based on the magnitude
function markerSize(magnitude) {
  return magnitude * 5;
}

// A function to determine the marker color based on the depth
function markerColor(depth) {
  if (depth < 10) return '#84f542'
  else if (depth >= 10 & depth < 30) return '#c2f542'
  else if (depth >= 30 & depth < 50) return '#f5d742'
  else if (depth >= 50 & depth < 70) return '#f5b642'
  else if (depth >= 70 & depth < 90) return '#f57242'
  else return '#f54242'
}

// function to get colors for legend
function getColor(d) {
  return d > 90 ? '#f54242' :
         d > 70 ? '#f57242' :
         d > 50 ? '#f5b642' :
         d > 30 ? '#f5d742' :
         d > 10 ? '#c2f542' :
                  '#84f542';
}