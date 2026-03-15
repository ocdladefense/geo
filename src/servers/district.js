import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import { point } from "@turf/helpers";
import { polygon } from "@turf/helpers";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import District from '@ocdla/lib-geo/District.js';
import express from 'express';


// Create a new router instance.
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

let houseDistricts, senateDistricts;
// Load house and senate district data.
loadHouseDistricts();
loadSenateDistricts();


router.post("/kml/house/addresses/districts", async (req, res) => {

    const incomingData = req.body;
    let addy1 = "118 NW Jackson Ave.Corvallis, Oregon 97330";
    let addy2 = "327 NW Greenwood Ave Ste 303 Bend Oregon 97703";

    let addresses = incomingData.addresses; // Assume this is an array of address strings
    let coords = [];
    let possibleDistricts = [];
    let results = [];

    coords = await Promise.all(addresses.map(async (address) => {
        let coords = await Geocoder.geocodeAddress(address);
        return [coords.lng, coords.lat];
    }));
    console.log(coords);
    possibleDistricts = coords.map(lngLat => {
        return houseDistricts.filter(district => !district.isOutside(lngLat));
    });
    console.log(possibleDistricts);


    results = coords.map((lngLat, i) => {
        console.log(lngLat);
        console.log(`Finding district for point ${lngLat}...`);
        var pt = point(lngLat);

        let possibles = possibleDistricts[i];

        for (let district of possibles)
        {
            const myPolygon = polygon([district.coords]);
            const isInside = booleanPointInPolygon(pt, myPolygon);
            if (isInside) return district;
        }

        return null;
    });

    results = results.map(district => district ? district.id : null);

    return res.json(results);
});


router.post("/kml/senate/addresses/districts", async (req, res) => {

    const incomingData = req.body;
    let addy1 = "118 NW Jackson Ave.Corvallis, Oregon 97330";
    let addy2 = "327 NW Greenwood Ave Ste 303 Bend Oregon 97703";

    let addresses = incomingData.addresses; // Assume this is an array of address strings
    let coords = [];
    let possibleDistricts = [];
    let results = [];

    coords = await Promise.all(addresses.map(async (address) => {
        let coords = await Geocoder.geocodeAddress(address);
        return [coords.lng, coords.lat];
    }));
    console.log(coords);
    possibleDistricts = coords.map(lngLat => {
        return senateDistricts.filter(district => !district.isOutside(lngLat));
    });
    console.log(possibleDistricts);


    results = coords.map((lngLat, i) => {
        console.log(lngLat);
        console.log(`Finding district for point ${lngLat}...`);
        var pt = point(lngLat);

        let possibles = possibleDistricts[i];

        for (let district of possibles)
        {
            const myPolygon = polygon([district.coords]);
            const isInside = booleanPointInPolygon(pt, myPolygon);
            if (isInside) return district;
        }

        return null;
    });

    results = results.map(district => district ? district.id : null);

    return res.json(results);
});



router.get("/kml/house/districts", (req, res) => {


    let latLngTest = [parseFloat(req.query.lat), parseFloat(req.query.lng)];
    // Below for testing.
    // Correspponds loosely to Corvallis, OR.
    // latLngTest = [44.547146, -123.277797];

    let possibleDistricts = houseDistricts.filter(district => !district.isOutside(latLngTest));
    console.log(`Possible districts for point ${latLngTest}:`, possibleDistricts.map(d => d.id));

    return res.json(possibleDistricts);
});


router.get("/kml/senate/districts", (req, res) => {


    let latLngTest = [parseFloat(req.query.lat), parseFloat(req.query.lng)];

    let possibleDistricts = senateDistricts.filter(district => !district.isOutside(latLngTest));
    console.log(`Possible districts for point ${latLngTest}:`, possibleDistricts.map(d => d.id));

    return res.json(possibleDistricts);
});




router.get("/kml/house/:district", (req, res) => {

    // Load the XML in a parser.
    const text = fs.readFileSync(`./src/data/geo/house-district-${req.params.district}.txt`, 'utf8').trim();

    // parse "lng,lat" pairs separated by whitespace into [{lat, lng}, ...]
    let coords = text.split(/\s+/).map(pair => {
        const [lngStr, latStr] = pair.split(',');
        let lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);
        if (Number.isNaN(lng) || Number.isNaN(lat)) throw new Error('Invalid pair: ' + pair);
        // Heuristic: if longitude looks like a positive 3-digit value (e.g. 123) but latitude is valid,
        // it's likely a missing negative sign for west longitudes — flip it.
        if (lng > 90 && lat >= -90 && lat <= 90) lng = -lng;
        return { lat, lng };
    });

    return res.json(coords);
});




function loadHouseDistricts() {
    const geojsonHouse = fs.readFileSync(`./src/data/geo/house-districts.geojson`, 'utf8').trim();

    // parse "lng,lat" pairs separated by whitespace into [{lat, lng}, ...]
    let housecoords = JSON.parse(geojsonHouse);

    houseDistricts = housecoords.features.map((district, index) => {
        let coords = district.geometry.coordinates;
        return new District(coords, index + 1);
    });

}


function loadSenateDistricts() {
    const geojsonSenate = fs.readFileSync(`./src/data/geo/senate-districts.geojson`, 'utf8').trim();

    // parse "lng,lat" pairs separated by whitespace into [{lat, lng}, ...]
    let senatecoords = JSON.parse(geojsonSenate);

    senateDistricts = senatecoords.features.map((district, index) => {
        let coords = district.geometry.coordinates;
        return new District(coords, index + 1);
    });

}


export default router;
