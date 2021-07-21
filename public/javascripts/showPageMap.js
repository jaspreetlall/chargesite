mapboxgl.accessToken = mapToken; // Comes from show.ejs
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/dark-v10', // style URL
// coordinates being provided by show.ejs
center: chargesite.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

// Enable navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Adding marker to the map
new mapboxgl.Marker()
  // Coordinates being provided by show.ejs
  .setLngLat(chargesite.geometry.coordinates)
  // Adding popup
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h5 class="card-title">${chargesite.title}</h5><p class="text-muted">${chargesite.location}</p>`
      )
  )
  .addTo(map)