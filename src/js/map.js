import MapManager from './utils/MapManager.js';
import DistrictManager from './utils/DistrictManager.js';
import Address from './utils/Address.js';
import Cache from './utils/Cache.js';
import { domReady } from './utils/domReady.js';
import { displayTextResults } from './components/districts/DistrictToAddressesTable.js';
import LookupTable from './components/districts/LookupTable.jsx';
import LegislativeDistrictLookupResult from './utils/LegislativeDistrictLookupResult.js';


let districtManager;
let cache;
let mapManager;


// This function is a workaround to load the Google Maps API using the new importLibrary method, which doesn't work with the standard callback approach. See https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic_library_import for more details.
function foobar() {

    (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
        key: process.env.GOOGLE_MAPS_API_KEY,
        v: "weekly",
        // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
        // Add other bootstrap parameters as needed, using camel case.
    });

}





// Work #1 - Load data and initialize map.
domReady(async function() {
    districtManager = new DistrictManager();
    // Load cache from storage
    cache = await Cache.loadFromDisk();
    // If server cache is empty, load from localStorage as fallback
    if (cache.getResults().length === 0) {
        const localCache = Cache.loadFromLocalStorage();
        if (localCache.getResults().length > 0) {
            cache = localCache;
        }
    }
    mapManager = new MapManager();

    // Load all data
    await districtManager.loadDistricts();
    await districtManager.loadRepresentatives();
    await districtManager.loadSenators();

    // Initialize MapManager singleton

    await mapManager.load();
});


// Work #2 - Draw district outlines on the map.
domReady(async function() {

    console.log("Drawing districts on the map...");
    // Outline all districts on the map
    districtManager.houseDistricts.forEach(district => {
        // console.log(`Drawing House District ${district.id} with ${district.coords.length} coordinates...`);
        mapManager.draw(district.getCoordsAsObjects(), 'H' + district.id, false)
    });
    districtManager.senateDistricts.forEach(district => {
        // console.log(`Drawing Senate District ${district.id} with ${district.coords.length} coordinates...`);
        mapManager.draw(district.getCoordsAsObjects(), 'S' + district.id, false)
    });
});



// Work #3 - Set up form handler.
domReady(async function() {
    // Set up form handler
    const form = document.getElementById('district-lookup');
    form.addEventListener('submit', onSubmit);
});



async function doWork(addresses) {


    await Promise.all(addresses.map(addr =>
        addr.geocode().then((addr) => mapManager.drawMarker(addr)))); // Geocode all addresses in parallel

    // Process each address, checking cache first
    addresses.forEach(addr => {

        // First check the cache for this address by ZIP
        const cached = cache.lookup(addr.zip);

        // Check if cached districts match the geocoded location
        let canUseCache = false;

        // If we have cached data, verify it against the geocoded location to ensure it's still valid
        if (cached) {
            const cachedHouse = districtManager.getHouseDistrict(cached.house);
            const cachedSenate = districtManager.getSenateDistrict(cached.senate);

            canUseCache = !!cachedHouse && !!cachedSenate;
                //&& districtManager.isLocationInDistrict(addr.location, cachedHouse)
                //&& districtManager.isLocationInDistrict(addr.location, cachedSenate);
        }

        // If cache is valid, use it. Otherwise, perform lookup and update cache.
        addr.house = canUseCache ? cached.house : districtManager.findHouseDistrict(addr.location);
        addr.senate = canUseCache ? cached.senate : districtManager.findSenateDistrict(addr.location);

        // Might not want to do this each time.
        cache.put(addr);

    });



    cache.saveToLocalStorage();
    await cache.saveToDisk();
    // Save result in the cache
    // Result has house, senate, and zipcode

    //let results = cache.getResults();
    // Everytime lookup finds something in the cache, increment hit counter
    console.log("Hits: " + cache.getHits());
    console.log("Misses: " + cache.getMisses());
    console.log("Variants", cache.variants);



    let groupedByHouse = Object.groupBy(addresses, a => a.house);
    let groupedBySenate = Object.groupBy(addresses, a => a.senate);

    for (let houseId in groupedByHouse)
    {
        let house = districtManager.getHouseDistrict(houseId);
        if (null == house) continue;
        house.addAddresses(groupedByHouse[houseId]);
    }

    for (let senateId in groupedBySenate)
    {
        let senate = districtManager.getSenateDistrict(senateId);
        if (null == senate) continue;
        senate.addAddresses(groupedBySenate[senateId]);
    }


    for (let houseId in groupedByHouse)
    {
        mapManager.shadePolygon('H' + houseId);
    }
}





async function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const addressInput = document.getElementById('address').value;
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Checking...';


    // Parse addresses
    const addresses = addressInput.split(/\r?\n/)
        .map(a => new Address(a.trim()))
        .filter(a => a.isValid()); // Filter out invalid addresses




    // Clear previous results (highlights and markers only, keep outlines)
    mapManager.resetPolygons();
    mapManager.clearMarkers();
    districtManager.clearAllAddresses();

    // Process the addresses, geocoding and finding districts, with caching.
    await doWork(addresses);

    // Display text results.
    const houseDistrictsWithAddresses = districtManager.getHouseDistrictsWithAddresses();
    const senateDistrictsWithAddresses = districtManager.getSenateDistrictsWithAddresses();

    displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses);

}




/**
 * 
 * @param {*} e 
 * Previous client function.  Does processing on the server side, which is much faster for large batches of addresses.  Still needs work to display results in a nice format.
 */
async function onSubmitArchived(addresses) {


    let resultDiv = document.getElementById('result');
    let statusMessage = "Checking...";
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
}
