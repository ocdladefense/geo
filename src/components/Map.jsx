import { useEffect } from 'react';
import MapManager from '@ocdla/lib-geo/MapManager.js';
import DistrictManager from '@ocdla/lib-geo/DistrictManager.js';
import Address from '@ocdla/lib-geo/Address.js';
import Cache from '@ocdla/lib-geo/Cache.js';
import { domReady } from '@ocdla/lib-utils/domReady.js';
import ResultsTable from './districts/ResultsTable.jsx';
// import LookupTable from './districts/LookupTable.jsx';
// import LegislativeDistrictLookupResult from './districts/LegislativeDistrictLookupResult.js';
import AddressSearch from './AddressSearch.jsx';
import Results from './Results.jsx';
import { processAddresses } from '@ocdla/lib-geo/AddressProcessor.js';

let districtManager;
let cache;
let mapManager;




export default function Map() {


    useEffect(function() {
        async function initialize() {
            await draw();
            render();
        }
        initialize();
    }, []); // Run once on component mount

    return (
        <div style={{ position: 'relative', justifyContent: 'space-between', height: '100vh', width: '100%' }}>
            <div id="form-container" className="block w-[100%] tablet:w-[20%] tablet:absolute" style={{ backgroundColor: "rgba(255,255,255,0.9)", zIndex: "1", top: 0, left: 0, padding: '20px', boxSizing: 'border-box', margin: '10px', marginTop: '80px', borderRadius: '5px' }}>
                <AddressSearch mapManager={mapManager} onSubmit={onSubmit} onMapReset={() => mapManager.resetZoom()} />

                <div id="result"></div>
                {/* <Results mapManager={mapManager} /> */}
            </div>
            <div id="map" style={{ flex: 1, width: '100%', height: '100%' }}></div>


        </div >
    );
}




// Work #1 - Load data and initialize map.
domReady(async function() {
    districtManager = new DistrictManager();
    // Load cache from storage
    // cache = await Cache.loadFromDisk();

    // If server cache is empty, load from localStorage as fallback
    cache = Cache.loadFromLocalStorage();

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

    mapManager = new MapManager();

    /*

    function updateLabelVisibility() {
        // Show or hide labels based on the current zoom level and their specified minimum zoom
        const zoomLevel = this.map.getZoom() ?? 0;
        this.currentLabels.forEach(({ marker, minZoom, baseText }) => {
            marker.setVisible(zoomLevel >= minZoom);

            const labelText = zoomLevel >= 14 ? `District ${baseText}` : baseText;
            const currentLabel = marker.getLabel();
            const currentText = typeof currentLabel === 'string' ? currentLabel : currentLabel?.text;

            if (currentText !== labelText)
            {
                marker.setOptions({
                    label: {
                        ...(typeof currentLabel === 'object' && currentLabel ? currentLabel : {}),
                        text: labelText,
                    }
                });
            }
        });
    }

    mapManager.onZoomChange(updateLabelVisibility);
    */

    await mapManager.load();


    mapManager.drawDistricts(districtManager.houseDistricts);
    mapManager.drawDistricts(districtManager.senateDistricts);

    mapManager.renderAll();
}



function render() {



    const select = document.getElementById('district-select');
    const selectedType = select?.value === 'senate' ? 'senate' : 'house';
    if (select && !select.value)
    {
        select.value = 'house';
    }

    function keyFunction(key) {
        if (selectedType === 'house')
        {
            return key.startsWith('H');
        } else if (selectedType === 'senate')
        {
            return key.startsWith('S');
        }
    }

    mapManager.render(keyFunction);
    // mapManager.renderZoomFunction((entry) => { entry.minZoom > currentZoomLevel });
}



async function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const addressInput = document.getElementById('address').value;
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Checking...';


    // Parse addresses
    const input = addressInput.split(/\r?\n/)
        .map(a => new Address(a.trim()))
        .filter(a => a.isValid()); // Filter out invalid addresses



    // Clear previous results (highlights and markers only, keep outlines)
    mapManager.resetPolygons();
    mapManager.clearMarkers();
    districtManager.clearAllAddresses();



    // Process the addresses, geocoding and finding districts, with caching.
    let addresses = await processAddresses(districtManager, input, addr => mapManager.drawMarker(addr));



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





    // Check if the "Order by District" checkbox is checked
    const orderByDistrict = document.getElementById('order-by-district')?.checked ?? false;



    // Base case.
    let tableElement = ResultsTable(addresses);
    resultDiv.appendChild(tableElement);
    tableElement.addEventListener('click', (e) => {
        let target = e.target;
        if (target.tagName === 'A')
        {
            const lat = parseFloat(target.dataset.lat);
            const lng = parseFloat(target.dataset.lng);
            const obj = { lat, lng };
            const house = target.dataset.house;
            const senate = target.dataset.senate;
            // This function, below, doesn't exist or doesn't do anything.
            // We need to pan to the location.
            // And we need to zoom to an "appropriate" level, which is tentatively zoom level 10.
            // mapManager.zoomToFeature({ lat, lng });

            // #1 - Pan and zoom - DEFINITELY WANT THIS.
            // #2 - Highlight the district. - DEFINITELY WANT THIS.
            // #3 - Fit the district to the screen.
            // #4 - Bonus: Show a popup with the address and district info.

            let houseLabel = "H" + house;
            let senateLabel = "S" + senate;
            mapManager.shadePolygon(houseLabel);
            mapManager.shadePolygon(senateLabel, '#e55734');
            mapManager.panTo(obj);
        }
    });



    /*
        let latestHouseDistrictsWithAddresses = [];
        let latestSenateDistrictsWithAddresses = [];
        let latestAddresses = [];
    
    
        // Display text results.
        latestHouseDistrictsWithAddresses = districtManager.getHouseDistrictsWithAddresses();
        latestSenateDistrictsWithAddresses = districtManager.getSenateDistrictsWithAddresses();
        latestAddresses = addresses.slice();
    
        const select = document.getElementById('district-select');
        const selectedType = select?.value === 'senate' ? 'senate' : 'house';
        mapManager.renderDistrictLayer(selectedType);
    
        // Display text results for the selected district type
        await displayTextResults(
            latestHouseDistrictsWithAddresses,
            latestSenateDistrictsWithAddresses,
            latestAddresses,
            mapManager,
            districtManager,
            selectedType
        );
        */

}





