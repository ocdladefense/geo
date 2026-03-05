
import LookupTable from './components/districts/LookupTable.jsx';
import domReady from './utils/domReady.js';
import { injectScriptElement } from './utils/html.js';


// Initialize and add the map
let map;


class LegislativeDistrictLookupResult {

    results = {};

    setSenate(address, district) {
        if (!this.results[address])
        {
            this.results[address] = { houseDistrict: null, senateDistrict: null };
        }
        this.results[address].senateDistrict = district;
    }

    setHouse(address, district) {
        if (!this.results[address])
        {
            this.results[address] = { houseDistrict: null, senateDistrict: null };
        }
        this.results[address].houseDistrict = district;
    }

    static from(addresses, houseDistricts, senateDistricts) {
        let result = new LegislativeDistrictLookupResult();
        for (let i = 0; i < addresses.length; i++)
        {
            result.setHouse(addresses[i], houseDistricts[i]);
            result.setSenate(addresses[i], senateDistricts[i]);
        }
        return result;
    }
}


// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
function foobar() {

    (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
        key: process.env.GOOGLE_MAPS_API_KEY,
        v: "weekly",
        // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
        // Add other bootstrap parameters as needed, using camel case.
    });

}





async function initMap() {
    console.log('initMap called');
    // The location of Uluru
    const position = { lat: -25.344, lng: 131.031 };
    // Request needed libraries.
    //@ts-ignore
    // const { Map } = await google.maps.importLibrary("maps");
    // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    await google.maps.importLibrary("geometry");
    await google.maps.importLibrary("geocoding");

}




domReady(async function() {

    // let scriptTag = injectScriptElement(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap`);

    foobar();
    initMap();

    let form = document.getElementById('district-lookup');
    form.addEventListener('submit', async function(event) {

        let action = event.submitter.id;
        event.preventDefault(); // Prevent form submission.
        event.stopPropagation();
        let addresses = document.getElementById('addresses').value.split(/\r?\n/).map(addr => addr.trim()).filter(addr => addr.length > 0);
        let resultDiv = document.getElementById('result');
        let statusMessage = "Checking...";
        let messages = [];

        resultDiv.textContent = statusMessage;

        let body = { addresses: addresses };
        let houseDistrict = await fetch(`/kml/house/addresses/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => res.json());

        let senateDistrict = await fetch(`/kml/senate/addresses/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => res.json());



        console.log('House Districts:', houseDistrict);
        console.log('Senate Districts:', senateDistrict);


        let results = LegislativeDistrictLookupResult.from(addresses, houseDistrict, senateDistrict);
        resultDiv.appendChild(LookupTable(results));
    });
});

