import MapManager from './utils/MapManager.js';
import DistrictManager from './utils/DistrictManager.js';
import Address from './utils/Address.js';
import Cache from './utils/Cache.js';
import { displayTextResults } from './components/districts/DistrictToAddressesTable.js';
import { domReady } from './utils/domReady.js';



let districtManager;
let cache;
let mapManager;









// Work #1 - Load data and initialize map.
domReady(async function() {
    districtManager = new DistrictManager();
    cache = Cache.loadFromLocalStorage();
    mapManager = MapManager.getInstance();

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

        // Not in cache, find districts first, then store
        addr.house = null == cached ? districtManager.findHouseDistrict(addr.location) : cached.house;
        addr.senate = null == cached ? districtManager.findSenateDistrict(addr.location) : cached.senate;


        // Might not want to do this each time.
        cache.put(addr);

    });



    cache.saveToLocalStorage();
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
    const addresses = addressInput.split('\n')
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
