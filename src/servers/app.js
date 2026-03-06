/**
 * https://expressjs.com/en/starter/hello-world.html
 * OpenID: https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_using_openid.htm&type=5
 * So we can extract some user information.
 */

import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import xml2js from 'xml2js';
import { point } from "@turf/helpers";
import { polygon } from "@turf/helpers";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import District from '../js/utils/District.js';
import Geocoder from '../js/utils/Geocoder.js';


const app = express();
const port = process.env.PORT || 80;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SF_ACCESS_TOKEN = process.env.SF_OAUTH_SESSION_ACCESS_TOKEN_OVERRIDE;
let houseDistricts, senateDistricts;
console.log(process.cwd());

let serverCache = {
    hits: 0,
    misses: 0,
    results: [],
    variants: {}
};

// Serve static files from the 'dist' directory
app.use(cors());
app.use(express.static('dist'));
app.use(cookieParser());
app.use(express.json());

// Load house and senate district data.
loadHouseDistricts();
loadSenateDistricts();


// Cache API endpoints
app.get("/api/cache", (req, res) => {
    res.json(serverCache);
});

app.post("/api/cache", (req, res) => {
    const { hits, misses, results, variants } = req.body;

    if (hits !== undefined) serverCache.hits = hits;
    if (misses !== undefined) serverCache.misses = misses;
    if (results !== undefined) serverCache.results = results;
    if (variants !== undefined) serverCache.variants = variants;

    console.log(`Cache saved to server. Hits: ${serverCache.hits}, Misses: ${serverCache.misses}, Variants: ${JSON.stringify(serverCache.variants)}`);
    res.json({ success: true, message: 'Cache saved'});
});



app.get("/geocode", async (req, res) => {

    let address = req.query.address;
    let coords = await Geocoder.geocodeAddress(address);
    console.log(`Geocode for address "${address}":`, coords);
    res.json(coords);
});



app.get("/legislators/:type", async (req, res) => {

    // If the important json file already exists skip all this below and return the json file
    let json;
    let fileExists = fs.existsSync(`./dist/data/legislators.json`);

    if (fileExists) {
        let content = fs.readFileSync(`./dist/data/legislators.json`, 'utf-8');

        json = JSON.parse(content);
    } else {
        json = await slowLoadData();
    }

    let filtered = json.filter(leg => leg.Chamber == (req.params.type == "senators" ? "S" : "H"));

    console.log(filtered);

    res.json(filtered.sort((a, b) => {
        return parseInt(a.DistrictNumber) - parseInt(b.DistrictNumber);
    }));





});

async function slowLoadData() {
    const SESSION = "2026R1";//"2025I1"; // "2026R1" doesn't begin until Feb. 2.

    // With parser
    var parser = new xml2js.Parser({
        trim: false,          // Do not trim whitespaces
        explicitCharkey: true // Force _ key for text nodes
    });
    let legislators;
    let fileExists = fs.existsSync('./dist/data/legislators.xml');
    legislators = fileExists ? fs.readFileSync('./dist/data/legislators.xml', 'utf-8') : await fetch("https://api.oregonlegislature.gov/odata/ODataService.svc/Legislators").then(res => res.text());
    let result = await parser.parseStringPromise(legislators);
    // res.json(result);




    let all = result.feed.entry.map(leg => {
        let content = leg.content[0];
        let properties = content["m:properties"][0];

        if (!properties) return {};
        // console.log(properties);

        let webSiteUrl = properties["d:WebSiteUrl"][0]._;
        // console.log("WebSiteUrl:", webSiteUrl)._;
        let legislatorCode = properties["d:LegislatorCode"][0]._;
        let firstName = properties["d:FirstName"][0]._;
        let lastName = properties["d:LastName"][0]._;
        let sessionKey = properties["d:SessionKey"][0]._;
        let districtNumber = properties["d:DistrictNumber"][0]._;
        let emailAddress = properties["d:EmailAddress"][0]._;
        let title = properties["d:Title"][0]._;
        let party = properties["d:Party"][0]._;
        let chamber = properties["d:Chamber"][0]._;



        // Compute the URL to the legislator's jpg image.
        let codeParts = legislatorCode.split(" ");
        let type = codeParts.shift();
        let code = codeParts.join();
        code = code.replace(/\,/g, "");
        code = webSiteUrl && webSiteUrl.split("/").pop();


        // Build the URL.

        let parts = ["https://www.oregonlegislature.gov"];
        parts = ["https://www.oregonlegislature.gov", `${code}`, "PublishingImages/member_photo.jpg"];
        // parts.push(chamber == "S" ? "senate" : "house");
        // parts.push("MemberPhotos");
        // parts.push(`${code}.jpg`);


        let imageUrl = parts.join("/");

        return {
            FirstName: firstName,
            LastName: lastName,
            SessionKey: sessionKey,
            DistrictNumber: districtNumber,
            EmailAddress: emailAddress,
            Title: title,
            Party: party,
            Chamber: chamber,
            ImageUrl: imageUrl,
            WebSiteUrl: webSiteUrl
        };

    });


    // At least get current session legislators.
    let filtered = all.filter((leg) => leg.SessionKey.indexOf(SESSION) !== -1);


    // Save the fetched data to a local file for future use if it doesn't already exist
    if (!fileExists) {
        fs.writeFileSync('./dist/data/legislators.json', JSON.stringify(filtered), 'utf-8');
    }

    if (!fileExists) {
        // Save the fetched data to a local file for future use
        fs.writeFileSync('./dist/data/legislators.xml', legislators, 'utf-8');
    }
        

    return filtered;
}

app.get("/legislators", async (req, res) => {

    const legislators = await fetch("https://api.oregonlegislature.gov/odata/ODataService.svc/Legislators").then(res => res.text());
    // With parser
    var parser = new xml2js.Parser(/* options */);
    let result = await parser.parseStringPromise(legislators);
    res.json(result);
});




app.post("/kml/house/addresses/districts", async (req, res) => {

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


app.post("/kml/senate/addresses/districts", async (req, res) => {

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



app.get("/kml/house/districts", (req, res) => {


    let latLngTest = [parseFloat(req.query.lat), parseFloat(req.query.lng)];
    // Below for testing.
    // Correspponds loosely to Corvallis, OR.
    // latLngTest = [44.547146, -123.277797];

    let possibleDistricts = houseDistricts.filter(district => !district.isOutside(latLngTest));
    console.log(`Possible districts for point ${latLngTest}:`, possibleDistricts.map(d => d.id));

    return res.json(possibleDistricts);
});


app.get("/kml/senate/districts", (req, res) => {


    let latLngTest = [parseFloat(req.query.lat), parseFloat(req.query.lng)];

    let possibleDistricts = senateDistricts.filter(district => !district.isOutside(latLngTest));
    console.log(`Possible districts for point ${latLngTest}:`, possibleDistricts.map(d => d.id));

    return res.json(possibleDistricts);
});




app.get("/kml/house/:district", (req, res) => {

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




// Todo, turn this into a POST endpoint.
app.get("/introspect", async (req, res) => {

    const data = new URLSearchParams({
        token: SF_ACCESS_TOKEN,
        client_id: SF_OAUTH_SESSION_CLIENT_ID,
        client_secret: SF_OAUTH_SESSION_CLIENT_SECRET,
        token_type_hint: "access_token"
    });

    console.log(data);

    // Exchange authorization code for access token & id_token.
    const resp = await fetch(SF_OAUTH_SESSION_INSTANCE_URL + "/services/oauth2/introspect", {
        method: "POST",
        body: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const access_token_data = await resp.json();
    console.log(access_token_data);
});







app.get("/login", (req, res) => {
    const state = "some_state";
    // const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
    const loginUrl = `${process.env.SF_OAUTH_SESSION_URL}?client_id=${process.env.SF_OAUTH_SESSION_CLIENT_ID}&redirect_uri=${process.env.SF_OAUTH_SESSION_CALLBACK_URL}&response_type=code&state=${state}`;//&scope=${scopes}`;
    res.redirect(loginUrl);
});



app.get("/logout", (req, res) => {

    res.cookie('instanceUrl', '', { expires: new Date(0) }); // Setting expiration to epoch
    res.cookie('accessToken', '', { expires: new Date(0) }); // Setting expiration to epoch
    res.redirect("/");
});




app.get("/oauth/api/request", async (req, res) => {

    console.log(req.query);

    const { code } = req.query;


    const data = new URLSearchParams({
        code,
        client_id: process.env.SF_OAUTH_SESSION_CLIENT_ID,
        client_secret: process.env.SF_OAUTH_SESSION_CLIENT_SECRET,
        redirect_uri: process.env.SF_OAUTH_SESSION_CALLBACK_URL,
        grant_type: "authorization_code"
    });

    console.log(data);

    // Exchange authorization code for access token & id_token.
    const response = await fetch(process.env.SF_OAUTH_SESSION_TOKEN_URL, {
        method: "POST",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    console.log("Receiving response...");
    const access_token_data = await response.json();
    console.log(access_token_data);


    res.cookie('instanceUrl', access_token_data.instance_url, { maxAge: 86400000 }); // Cookie expires in 24 hours
    res.cookie('accessToken', access_token_data.access_token, { maxAge: 86400000 }); // Cookie expires in 24 hours
    // What is id_token?
    const { id_token } = access_token_data;

    res.redirect("/");
});










app.get("/connect", async (req, res) => {

    const data = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SF_OAUTH_APPLICATION_CLIENT_ID,
        client_secret: process.env.SF_OAUTH_APPLICATION_CLIENT_SECRET
    });

    console.log(data);

    // Exchange authorization code for access token & id_token.
    const response = await fetch(process.env.SF_OAUTH_APPLICATION_TOKEN_ENDPOINT, {
        method: "POST",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    console.log("Receiving client credential response...");
    const token = await response.json();
    console.log(token);

    res.json(token);
});





// Define a route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});




// Define a route to serve index.html
app.all('/{*any}', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});




// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
