
import DistrictManager from './DistrictManager.js';
import Address from './Address.js';
import Cache from './/Cache.js';



const USE_CACHE = false;

export { processAddresses };

async function processAddresses(districtManager, addresses, onGeocode) {

    await Promise.all(addresses.map(addr =>
        addr.geocode().then(onGeocode))); // Geocode all addresses in parallel

    // Process each address, checking cache first
    addresses.forEach(addr => {

        // First check the cache for this address by ZIP
        const cached = USE_CACHE ? cache.lookup(addr.zip) : null;

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



        if (USE_CACHE)
        {
            cache.put(addr); // Update cache with new result, even if it was a hit, to ensure we have the latest geocoding info in case of variants
        }


        // the cache says addr.zip is in a certain district but if we load that district and we ask if its inside itll say no 
    });



    if (USE_CACHE)
    {
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
    }



    return addresses;
}
