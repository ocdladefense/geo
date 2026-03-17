import { createScriptElement, injectScriptElement } from "@ocdla/lib-utils/html.js";



export default class MapManager {


    // Google Map instance
    map = null;

    // Track current district polygons on the map for cleanup
    currentPolygons = new Map();

    // Track district number labels so they can persist independently of address markers.
    currentLabels = new Map();

    // Track current address markers on the map for cleanup
    currentMarkers = [];

    // Store any additional metadata for districts, labels, and addresses as needed.
    metadata = new Map();


    zoomListener = null; // Store the zoom listener reference for cleanup



    constructor() { }




    render(keyFunction) {

        // Based oon the provided key function, determine which districts to render and which to hide. This allows us to render both house and senate districts at once without needing to clear polygons in between.

        this.currentPolygons.forEach((polygon, key) => {
            const shouldRender = keyFunction(key);
            polygon.setMap(shouldRender ? this.map : null);
        });

        this.currentLabels.forEach((label, key) => {
            const shouldRender = keyFunction(key);
            label.setMap(shouldRender ? this.map : null);
        });

    }


    renderAll() {
        this.currentPolygons.forEach((polygon, key) => {
            polygon.setMap(this.map);
        });

        this.currentLabels.forEach((label, key) => {
            label.setMap(this.map);
        });

        this.currentMarkers.forEach(marker => {
            marker.setMap(this.map);
        });
    }

    // This gets called on zoom change.
    reRender() {


        const existingLabel = this.currentLabels.get(key);

        if (existingLabel)
        {
            existingLabel.marker.setPosition(center);
            existingLabel.marker.setMap(this.map);
            existingLabel.minZoom = minZoom;
            existingLabel.baseText = String(text);
            this.updateLabelVisibility();
            return;
        }



        this.updateLabelVisibility();
    }



    getLabelMinZoom(district) {
        const districtSpan = district.getDistrictSize();

        // For small districts, show labels at all zoom levels
        if (districtSpan < 0.18)
        {
            return 10;
        }

        // For larger districts, we can show labels at a more zoomed-out level
        if (districtSpan < 0.35)
        {
            return 9;
        }

        return 0;
    }



    onZoomChange(callback) {
        if (this.zoomListener)
        {
            google.maps.event.removeListener(this.zoomListener);
        }
        this.zoomListener = this.map.addListener('zoom_changed', callback.bind(this));
    }

    removeZoomChangeListener() {
        if (this.zoomListener)
        {
            google.maps.event.removeListener(this.zoomListener);
            this.zoomListener = null;
        }
    }






    // Getter for the map instance
    getMap() {
        return this.map;
    }

    clearPolygons() {
        // Remove all polygons from the map and clear the tracking array
        this.currentPolygons.forEach(polygon => polygon.setMap(null));
        this.currentPolygons.clear();
    }

    clearLabels() {
        this.currentLabels.forEach(({ marker }) => marker.setMap(null));
        this.currentLabels.clear();
    }

    clearMarkers() {
        // Remove all markers from the map and clear the tracking array
        this.currentMarkers.forEach(marker => marker.setMap(null));
        this.currentMarkers = [];
    }







    // Add a marker to the map and track it for cleanup
    addMarker(marker) {
        this.currentMarkers.push(marker);
    }



    addMetadata(key, metadata) {
        this.metadata.set(key, metadata);
    }



    drawDistricts(districts) {


        // Determine which districts to render based on selected type


        // Render each district as a polygon with a label
        districts.forEach(district => {

            const prefix = district.type === 'senate' ? 'S' : 'H';

            const key = prefix + district.id;

            const contentCallback = district.type === 'senate'
                ? () => district.getSenateDistrictInfo()
                : () => district.getHouseDistrictInfo();

            // Setup a polygon representing the district.
            let poly = this.draw(district.getCoordsAsObjects(), false, contentCallback);
            this.currentPolygons.set(key, poly);

            // Setup a label for the polygon.
            let minZoom = this.getLabelMinZoom(district);
            let meta = {
                minZoom,
                baseText: String(district.id)
            };

            let label = this.drawLabel(district.findCenter(), district.id);
            this.currentLabels.set(key, label);

            // Store any metadata for the district and label.
            this.metadata.set(key, meta);
        });
    }




    // Draw a polygon on the map
    draw(paths, shaded = false, content = null) {
        const polygon = new google.maps.Polygon({
            paths: paths,
            fillColor: '#2b6cb0',
            fillOpacity: shaded ? 0.35 : 0.0, // Fill only if shaded
            strokeColor: '#2b6cb0',
            strokeOpacity: 1,
            strokeWeight: 4,
            clickable: !!content
        });
        polygon.setMap(null);

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

        return polygon;
    }



    // Draw a persistent district label at its center point.
    drawLabel(center, text) {


        const label = new google.maps.Marker({
            position: center,
            map: null,
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



        return label;
    }



    // Draw markers for all addresses within the given districts
    drawMarker(address) {
        // For each address in the district, create a marker
        const marker = new google.maps.Marker({
            position: address.location,
            map: null,
            title: address.address
        });

        this.addMarker(marker); // Track marker for cleanup

        return marker;
    }


    // drawAndHide()

    panTo(location) {
        this.map.panTo(location);
        this.map.setZoom(10); // Zoom to an appropriate level for viewing the district
    }






    // Zoom to fit a district object or a google.maps.Polygon.
    zoomToFeature(feature) {
        const bounds = new google.maps.LatLngBounds();

        // If the feature is a polygon, we need to iterate through its paths to extend the bounds
        if (typeof feature.getPaths === 'function')
        {
            const paths = feature.getPaths();
            for (let i = 0; i < paths.getLength(); i++)
            {
                const path = paths.getAt(i);
                for (let j = 0; j < path.getLength(); j++)
                {
                    bounds.extend(path.getAt(j));
                }
            }
        }
        // If the feature has a method to get its coordinates as LatLng objects, use that to extend the bounds
        else if (typeof feature.getCoordsAsObjects === 'function')
        {
            feature.getCoordsAsObjects().forEach(coord => bounds.extend(coord));
        } else
        {
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
    shadePolygon(id, color = '#2b6cb0') {
        const polygon = this.getPolygonById(id);
        if (polygon)
        {
            polygon.setOptions({ fillOpacity: 0.35, fillColor: color });
            polygon.setMap(this.map);
        }
    }

    // Reset polygon to unshaded state
    resetPolygon(id) {
        const polygon = this.getPolygonById(id);
        if (polygon)
        {
            polygon.setOptions({ fillOpacity: 0.0, fillColor: '#2b6cb0' });
            polygon.setMap(this.map);
        }
    }







    // Reset all polygons to unshaded state
    resetPolygons() {
        this.currentPolygons.forEach(polygon => {
            polygon.setOptions({
                fillOpacity: 0.0,
                fillColor: '#2b6cb0'

            });
            polygon.setMap(this.map);
        });
    }

    // Reset the map zoom and center to the default view
    resetZoom() {
        this.map.setZoom(7);
        this.map.setCenter({ lat: 43.9336, lng: -120.5583 });
        // 43.9336°N 120.5583°W﻿
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

        // this.updateLabelVisibility();
    }

    run(fn) {
        fn.bind(this)();
    }
}




async function initMap() {
    // Get the map element
    const mapEl = document.getElementById('map');
    if (!mapEl)
    {
        throw new Error('Map element not found');
    }


    let center = { lat: 42.21379354246165, lng: -120.77573729710579 };
    let center2 = { lat: 44.010, lng: -120.5583 };
    // Initialize the map
    let map = new google.maps.Map(mapEl, {
        zoom: 7,
        center: center2,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        mapTypeControl: false
    });
    let div = document.createElement("div");
    div.addEventListener("click", () => { window.scrollTo(0, 0); });
    div.style.backgroundColor = "white";
    div.style.padding = "5px";
    div.style.borderRadius = "3px";
    div.style.cursor = "pointer";
    div.style.zIndex = "5";
    div.style.fontSize = "12px";
    div.style.marginBottom = "10px";
    div.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
    div.innerHTML = "<strong>Oregon Legislative Districts</strong><br>Data from the Oregon Secretary of State's Office";
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(div);
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.createElement("div"));


    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
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




