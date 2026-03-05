import { createScriptElement, injectScriptElement } from "./html.js";



class MapManager {
    static instance = null; // Singleton instance
    map = null; // Google Map instance
    currentPolygons = new Map(); // Track current district polygons on the map for cleanup
    currentMarkers = []; // Track current address markers on the map for cleanup

    constructor() {
        // Enforce singleton pattern
        if (MapManager.instance)
        {
            return MapManager.instance;
        }
        MapManager.instance = this;
    }

    // Static method to get singleton instance
    static getInstance() {
        if (!MapManager.instance)
        {
            MapManager.instance = new MapManager();
        }
        return MapManager.instance;
    }

    // Getter for the map instance
    getMap() {
        return this.map;
    }

    clearPolygons() {
        // Remove all polygons from the map and clear the tracking array
        this.currentPolygons.forEach(polygon => polygon.setMap(null));
    }

    clearMarkers() {
        // Remove all markers from the map and clear the tracking array
        this.currentMarkers.forEach(marker => marker.setMap(null));
        this.currentMarkers = [];
    }



    // Add a polygon to the map and track it for cleanup
    addPolygon(polygon, key) {
        this.currentPolygons.set(key, polygon);
    }

    // Add a marker to the map and track it for cleanup
    addMarker(marker) {
        this.currentMarkers.push(marker);
    }

    // Draw a polygon on the map
    draw(paths, key, shaded = false, content = null) {
        const polygon = new google.maps.Polygon({
            paths: paths,
            fillColor: '#2b6cb0',
            fillOpacity: shaded ? 0.35 : 0.0, // Fill only if shaded
            strokeColor: '#2b6cb0',
            strokeOpacity: 1,
            strokeWeight: 2,
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
                fillOpacity: 0.0,
                clickable: false
            });
            // Clear all click listeners
            google.maps.event.clearListeners(polygon, 'click');
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

    // Clear all polygons and markers from the map
    clearAll() {
        this.clearPolygons();
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
        zoom: 6,
        center: { lat: 43.9336, lng: -120.5583 },
        mapTypeId: 'roadmap'
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




export default MapManager; // Export the singleton instance of MapManager
