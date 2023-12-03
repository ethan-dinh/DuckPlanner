let locationData = null;
let markers = [];
let locations = [];

mapboxgl.accessToken = 'pk.eyJ1IjoiZGluaGUiLCJhIjoiY2xwMTM5eDg1MGMweDJqbGU5dDV3eWx5bCJ9.vz8hKgk3LaLNuHFkUAk_4Q';
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/gt-scheduler/cktc4y61t018918qjynvngozg', // style URL
    center: [-123.07218196442119,44.044600230350085], // University of Oregon coordinates [lng, lat]
    zoom: 15.5 // starting zoom
  });

map.addControl(
new mapboxgl.NavigationControl());

function fetchLocations() {
    const apiEndpoint = "https://mr66cfpzq1.execute-api.us-west-2.amazonaws.com/ENABLE-API/retrieveLocations"; 

    // Show the loading bar
    return fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status})`);
            }
            return response.json();
        })
        .then(responseData => {
            return responseData;
        })
        .catch(error => {
            console.error("Error:", error);
            throw error;
        });
}

function updateMap() {
    // Remove all markers
    for (let i = 0; i < markers.length; i++) {
        markers[i].remove();
    }

    // iterate through the locations and add markers
    let processed = {};
    for (let i = 0; i < locations.length; i++) {
        const loc = locationData[locations[i][0]];
    
        if (loc) {
            let lat = loc["latitude"];
            if (processed[locations[i][0]]) {
                lat += 0.00005;
            } let long = loc["longitude"];

            const name = locations[i][1].split(',')[0];
            const desc = locations[i][1].split(',')[1];
            const popup = new mapboxgl.Popup({ offset: [0, -35] }).setHTML(
                `<h3 style="margin: 0px">${name}</h3>
                <p style="margin: 0px">${desc}</p>`
            );
            
            const marker = new mapboxgl.Marker({ color: `${colorMapping[locations[i][1]]}` })
                .setLngLat([lat, long])
                .setPopup(popup); // Attach the popup to the marker
            
            marker.addTo(map);
            markers.push(marker);

        } processed[locations[i][0]] = true;
    }
}

// Retrieve the location data
fetchLocations()
    .then(data => {
        console.log("RETRIEVED DATA");
        locationData = data;
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });