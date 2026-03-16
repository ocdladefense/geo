

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
function importGoogleMaps() {

    (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
        key: process.env.GOOGLE_MAPS_API_KEY,
        v: "weekly",
        // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
        // Add other bootstrap parameters as needed, using camel case.
    });

}

