import { createScriptElement, injectScriptElement } from "./html.js";



export default class MapManager {


    // Google Map instance
    map = null;

    // Track current district polygons on the map for cleanup
    currentPolygons = new Map();

    // Track current address markers on the map for cleanup
    currentMarkers = [];

    // Track district number labels so they can persist independently of address markers.
    currentLabels = new Map();



    constructor() { }


    // Getter for the map instance
    getMap() {
        return this.map;
    }

    clearPolygons() {
        // Remove all polygons from the map and clear the tracking array
        this.currentPolygons.forEach(polygon => polygon.setMap(null));
        this.currentPolygons.clear();
    }

    clearMarkers() {
        // Remove all markers from the map and clear the tracking array
        this.currentMarkers.forEach(marker => marker.setMap(null));
        this.currentMarkers = [];
    }

    clearLabels() {
        this.currentLabels.forEach(label => label.setMap(null));
        this.currentLabels.clear();
    }



    // Add a polygon to the map and track it for cleanup
    addPolygon(polygon, key) {
        this.currentPolygons.set(key, polygon);
    }

    // Add a marker to the map and track it for cleanup
    addMarker(marker) {
        this.currentMarkers.push(marker);
    }

    addLabel(label, key) {
        this.currentLabels.set(key, label);
    }

    // Draw a polygon on the map
    draw(paths, key, shaded = false, content = null) {
        const polygon = new google.maps.Polygon({
            paths: paths,
            fillColor: '#2b6cb0',
            fillOpacity: shaded ? 0.35 : 0.0, // Fill only if shaded
            strokeColor: '#2b6cb0',
            strokeOpacity: 1,
            strokeWeight: 4,
            clickable: !!content
        });
        polygon.setMap(this.map);
        this.addPolygon(polygon, key);
        // If a content function is provided, add a click listener to the polygon
        if (content)
        {
            polygon.addListener('click', async (event) => {
                const infoContent = await content(event);
                const infoWindow = new google.maps.InfoWindow({ content: infoContent });
                infoWindow.setPosition(event.latLng);
                infoWindow.open(this.map);
            });
        }
    }

    /*
    onZoomChange(e) {
        let zoomLevel = this.map.getZoom();
        let listOfLabels;
        let portlandPoint = [45.5051, -122.6750];
        let aroundPortland = portlandPoint RADIUS 150;
        let foobar = districtLabels.filter(label => label.position < aroundPortland);
        let certainZoomLevel = 10;
        if (zoomLevel > certainZoomLevel) {
            foobar.forEach(label => label.opacity = 0);
        } else {
            foobar.forEach(label => label.opacity = 1);
        }
    }*/

    // Shade districts and make them clickable with info windows
    makePolygonClickable(id, clickable = true, contentCallback = null) {
        const polygon = this.getPolygonById(id);
        if (polygon)
        {
            // Clear existing click listeners to prevent duplicates
            google.maps.event.clearListeners(polygon, 'click');
            // Set the polygon to be clickable and add a click listener if content is provided
            polygon.setOptions({ clickable: clickable });
            if (clickable && contentCallback)
            {
                google.maps.event.clearListeners(polygon, 'click');
                polygon.addListener('click', async (event) => {
                    const infoContent = await contentCallback(event);
                    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(this.map);
                });
            }

            polygon.setMap(this.map);
        }
    }

    // Get a polygon by its ID
    getPolygonById(id) {
        return this.currentPolygons.get(id);
    }

    // Shade a polygon by ID
    shadePolygon(id) {
        const polygon = this.getPolygonById(id);
        if (polygon)
        {
            polygon.setOptions({ fillOpacity: 0.35 });
            polygon.setMap(this.map);
        }
    }

    // Reset polygon to unshaded state
    resetPolygon(id) {
        const polygon = this.getPolygonById(id);
        if (polygon)
        {
            polygon.setOptions({ fillOpacity: 0.0 });
            polygon.setMap(this.map);
        }
    }

    // Reset all polygons to unshaded state
    resetPolygons() {
        this.currentPolygons.forEach(polygon => {
            polygon.setOptions({
                fillOpacity: 0.0 });
                polygon.setMap(this.map);
        });
    }

    // Draw markers for all addresses within the given districts
    drawMarker(address) {
        // For each address in the district, create a marker
        const marker = new google.maps.Marker({
            position: address.location,
            map: this.map,
            title: address.address
        });
        this.addMarker(marker); // Track marker for cleanup
    }

    // Draw a persistent district label at its center point.
    drawDistrictLabel(center, text, key) {
        const existingLabel = this.currentLabels.get(key);
        if (existingLabel)
        {
            existingLabel.setPosition(center);
            existingLabel.setMap(this.map);
            return;
        }

        const label = new google.maps.Marker({
            position: center,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0,
                fillOpacity: 0,
                strokeOpacity: 0
            },
            label: {
                text: String(text),
                color: '#1a1a1a',
                fontSize: '18px',
                fontWeight: '700'
            },
            clickable: false,
            zIndex: 1000
        });

        this.addLabel(label, key);
    }

    // Clear all polygons and markers from the map
    clearAll() {
        this.clearPolygons();
        this.clearLabels();
        this.clearMarkers();
    }

    async load() {
        this.map = await load().then(requestLibraries).then(initMap).catch(error => {
            console.error('Error loading Google Maps:', error);
        });
    }
}




async function initMap() {
    // Get the map element
    const mapEl = document.getElementById('map');
    if (!mapEl)
    {
        throw new Error('Map element not found');
    }



    // Initialize the map
    let map = new google.maps.Map(mapEl, {
        zoom: 7,
        center: { lat: 43.9336, lng: -120.5583 },
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy'
    });


    return map;
}

async function requestLibraries() {
    // Request needed libraries.
    await google.maps.importLibrary("maps");
    await google.maps.importLibrary("marker");
    await google.maps.importLibrary("geometry");
    await google.maps.importLibrary("geocoding");
}

function load() {
    let foobar = new Promise((resolve, reject) => {
        let script = createScriptElement("https://maps.googleapis.com/maps/api/js?key=AIzaSyCfWNi-jamfXgtp5iPBLn63XV_3u5RJK0c&");
        script.addEventListener('load', () => {
            resolve();
        });
        injectScriptElement(script);
    });

    return foobar;
}




