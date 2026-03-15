import { useEffect } from 'react';
import MapManager from '@ocdla/lib-geo/MapManager.js';
import DistrictManager from '@ocdla/lib-geo/DistrictManager.js';
import Address from '@ocdla/lib-geo/Address.js';
import Cache from '@ocdla/lib-geo/Cache.js';
import { domReady } from '@ocdla/lib-utils/domReady.js';
import { displayTextResults } from './districts/DistrictToAddressesTable.js';
import LookupTable from './districts/LookupTable.jsx';
import LegislativeDistrictLookupResult from './districts/LegislativeDistrictLookupResult.js';


let districtManager;
let cache;
let mapManager;
let latestHouseDistrictsWithAddresses = [];
let latestSenateDistrictsWithAddresses = [];



export default function Map() {

    useEffect(function() {
        async function initialize() {
            await draw();
        }
        initialize();
        setupFormHandler();
    }, []); // Run once on component mount

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '100vh', width: '100%' }}>
            <div id="form-container" style={{ width: '20%', padding: '10px', paddingTop: '80px', boxSizing: 'border-box' }}>
                <form id="district-lookup" method="post">
                    <label style={{ fontSize: 'larger' }} htmlFor="address">Enter Address:</label>
                    <textarea style={{ padding: '10px', fontSize: 'larger' }} id="address" name="address" rows="3" cols="60">118 NW Jackson Ave. Corvallis, Oregon 97330</textarea>

                    <button style={{ padding: '10px', fontSize: 'larger', marginTop: '5px' }} id="find-district" type="submit">Find district</button>

                    <label htmlFor="district-select">Show info for:</label>
                    <select id="district-select">
                        <option value="">--Select a district--</option>
                        <option value="house">House Districts</option>
                        <option value="senate">Senate Districts</option>
                    </select>

                    <div id="result"></div>
                </form>
            </div>

            <div id="map" style={{ width: '75%' }}></div>
        </div>
    );
}




// Work #1 - Load data and initialize map.
domReady(async function() {
    districtManager = new DistrictManager();
    // Load cache from storage
    //cache = await Cache.loadFromDisk();
    // If server cache is empty, load from localStorage as fallback

    cache = Cache.loadFromLocalStorage();


    mapManager = new MapManager();

    // Load all data
    await districtManager.loadDistricts();
    await districtManager.loadRepresentatives();
    await districtManager.loadSenators();
});


// Work #2 - Draw district outlines on the map.
// domReady(draw);

// Work #3 - Set up form handler.
// domReady(setupFormHandler);



async function draw() {

    await mapManager.load();
    const select = document.getElementById('district-select');
    const selectedType = select?.value === 'senate' ? 'senate' : 'house';
    if (select && !select.value)
    {
        select.value = 'house';
    }
    renderDistrictLayer(selectedType);
}

async function setupFormHandler() {
    // Set up form handler
    const form = document.getElementById('district-lookup');
    form.addEventListener('submit', onSubmit);

    const select = document.getElementById('district-select');
    if (select)
    {
        select.addEventListener('change', onDistrictTypeChange);
    }
}


function renderDistrictLayer(selectedType) {
    // Clear existing polygons and labels before rendering new ones
    mapManager.clearPolygons();
    mapManager.clearLabels();

    // Determine which districts to render based on selected type
    const districts = selectedType === 'senate' ? districtManager.senateDistricts : districtManager.houseDistricts;
    const prefix = selectedType === 'senate' ? 'S' : 'H';

    // Render each district as a polygon with a label
    districts.forEach(district => {
        const key = prefix + district.id;
        const contentCallback = selectedType === 'senate'
            ? () => district.getSenateDistrictInfo()
            : () => district.getHouseDistrictInfo();
        mapManager.draw(district.getCoordsAsObjects(), key, false, contentCallback);
        mapManager.drawDistrictLabel(district.findCenter(), `${district.id}`, `${key}-label`, mapManager.getLabelMinZoom(district));
    });
}


async function onDistrictTypeChange(event) {
    const selectedType = event.target.value === 'senate' ? 'senate' : 'house';
    renderDistrictLayer(selectedType);

    await displayTextResults(
        latestHouseDistrictsWithAddresses,
        latestSenateDistrictsWithAddresses,
        mapManager,
        districtManager,
        selectedType
    );
}



async function doWork(addresses) {


    await Promise.all(addresses.map(addr =>
        addr.geocode().then((addr) => mapManager.drawMarker(addr)))); // Geocode all addresses in parallel

    // Process each address, checking cache first
    addresses.forEach(addr => {

        // First check the cache for this address by ZIP
        const cached = cache.lookup(addr.zip);

        // If cache is valid, use it. Otherwise, perform lookup and update cache.
        addr.house = cached ? cached.house : districtManager.findHouseDistrict(addr.location);
        addr.senate = cached ? cached.senate : districtManager.findSenateDistrict(addr.location);
        if (cached)
        {
            let house = districtManager.getHouseDistrict(addr.house);

            if (house.isOutside([addr.location.lng(), addr.location.lat()]))
            {
                addr.house = districtManager.findHouseDistrict(addr.location);
                addr.senate = districtManager.findSenateDistrict(addr.location);
            }
        }



        cache.put(addr); // Update cache with new result, even if it was a hit, to ensure we have the latest geocoding info in case of variants


        // the cache says addr.zip is in a certain district but if we load that district and we ask if its inside itll say no 
    });



    cache.saveToLocalStorage();
    await cache.saveToDisk();
    cache.open();
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
    latestHouseDistrictsWithAddresses = districtManager.getHouseDistrictsWithAddresses();
    latestSenateDistrictsWithAddresses = districtManager.getSenateDistrictsWithAddresses();

    const select = document.getElementById('district-select');
    const selectedType = select?.value === 'senate' ? 'senate' : 'house';
    renderDistrictLayer(selectedType);

    // Display text results for the selected district type
    await displayTextResults(
        latestHouseDistrictsWithAddresses,
        latestSenateDistrictsWithAddresses,
        mapManager,
        districtManager,
        selectedType
    );

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



// This function is a workaround to load the Google Maps API using the new importLibrary method, which doesn't work with the standard callback approach. See https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic_library_import for more details.
function foobar() {

    (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
        key: process.env.GOOGLE_MAPS_API_KEY,
        v: "weekly",
        // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
        // Add other bootstrap parameters as needed, using camel case.
    });

}

