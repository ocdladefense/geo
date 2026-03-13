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

    zoomListener = null; // Store the zoom listener reference for cleanup



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
        this.currentLabels.forEach(({ marker }) => marker.setMap(null));
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

    addLabel(label, key, minZoom = 0) {
        this.currentLabels.set(key, {
            marker: label,
            minZoom
        });
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
                this.zoomToFeature(polygon);
                const infoContent = await content(event);
                const infoWindow = new google.maps.InfoWindow({ content: infoContent });
                infoWindow.setPosition(event.latLng);
                infoWindow.open(this.map);
            });
        }
    }

    getLabelMinZoom(district) {
        const districtSpan = district.getDistrictSize();

        // For small districts, show labels at all zoom levels
        if (districtSpan < 0.18) {
            return 10;
        }

        // For larger districts, we can show labels at a more zoomed-out level
        if (districtSpan < 0.35) {
            return 9;
        }

        return 0;
    }

    updateLabelVisibility() {
        // Show or hide labels based on the current zoom level and their specified minimum zoom
        const zoomLevel = this.map.getZoom() ?? 0;
        this.currentLabels.forEach(({ marker, minZoom }) => {
            marker.setVisible(zoomLevel >= minZoom);
            if (zoomLevel >= 14) {
                marker.setOptions({
                    label: {
                        text: "District " + marker.getLabel().text,
                    }
                });
            } else if (zoomLevel >= 10) {
                marker.setOptions({
                    label: {
                        text: marker.getLabel().text,
                    }
                });
            }
        });
    }

    bindZoomHandler() {
        this.zoomListener = this.map.addListener('zoom_changed', () => {
            this.updateLabelVisibility(); // Update label visibility on zoom change
            console.log('Zoom level changed to:', this.map.getZoom());
        });
    }

    // Zoom to fit a district object or a google.maps.Polygon.
    zoomToFeature(feature) {
        const bounds = new google.maps.LatLngBounds();

        // If the feature is a polygon, we need to iterate through its paths to extend the bounds
        if (typeof feature.getPaths === 'function') {
            const paths = feature.getPaths();
            for (let i = 0; i < paths.getLength(); i++) {
                const path = paths.getAt(i);
                for (let j = 0; j < path.getLength(); j++) {
                    bounds.extend(path.getAt(j));
                }
            }
        } 
        // If the feature has a method to get its coordinates as LatLng objects, use that to extend the bounds
        else if (typeof feature.getCoordsAsObjects === 'function') {
            feature.getCoordsAsObjects().forEach(coord => bounds.extend(coord));
        } else {
            return;
        }

        this.map.fitBounds(bounds);
        this.map.panTo(bounds.getCenter());
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
                    this.zoomToFeature(polygon);
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
    drawDistrictLabel(center, text, key, minZoom = 0) {
        const existingLabel = this.currentLabels.get(key);
        if (existingLabel)
        {
            existingLabel.marker.setPosition(center);
            existingLabel.marker.setMap(this.map);
            existingLabel.minZoom = minZoom;
            this.updateLabelVisibility();
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

        this.addLabel(label, key, minZoom);
        this.updateLabelVisibility();
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

        this.bindZoomHandler();
        this.updateLabelVisibility();
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




