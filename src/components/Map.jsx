import { useState, useEffect } from 'react';
import MapManager from '@ocdla/lib-geo/MapManager.js';
import DistrictManager from '@ocdla/lib-geo/DistrictManager.js';
import Address from '@ocdla/lib-geo/Address.js';
import Cache from '@ocdla/lib-geo/Cache.js';
import { domReady } from '@ocdla/lib-utils/domReady.js';
// import LookupTable from './districts/LookupTable.jsx';
// import LegislativeDistrictLookupResult from './districts/LegislativeDistrictLookupResult.js';
import AddressSearch from './AddressSearch.jsx';
import Results from './Results.jsx';
import { processAddresses } from '@ocdla/lib-geo/AddressProcessor.js';

let districtManager;
let mapManager;
let cache;
let latestGroupedByHouse = {};
let latestGroupedBySenate = {};



export default function Map() {


    let [addresses, setAddresses] = useState([]);
    let submitFunction = getSubmitFunction(setAddresses);
    // // Check if the "Group By District" checkbox is checked
    const orderByDistrict = document.getElementById('order-by-district')?.checked ?? false;



    useEffect(function() {
        let cleanup = () => { };
        //
        async function initialize() {
            await draw();
            render();
            // Add event listener for district type selection
            const select = document.getElementById('district-select');
            if (select)
            {
                // When the district type changes, we want to re-render the map to show the appropriate districts.
                const onDistrictChange = () => render();
                select.addEventListener('change', onDistrictChange);
                cleanup = () => select.removeEventListener('change', onDistrictChange);
            }
        }

        initialize();

        // Cleanup function to remove event listeners when the component unmounts
        return function() {
            cleanup();
        };
    }, []); // Run once on component mount

    return (
        <div className="relative h-[100vh] w-[100%] overflow-auto tablet:overflow-hidden">

            <div className="static tablet:absolute tablet:w-[25%] top-[40px] left-[10px] z-10">

                <div id="form-container" className="block w-auto tablet:w-[120%] " style={{ backgroundColor: "rgba(255,255,255,0.9)", zIndex: "1", padding: '20px', boxSizing: 'border-box', margin: '10px', marginTop: '20px', borderRadius: '5px' }}>
                    <AddressSearch mapManager={mapManager} onSubmit={submitFunction} />
                </div>


                <div id="form-container" className="block w-[100%] " style={{ backgroundColor: "rgba(255,255,255,0.9)", zIndex: "1", padding: '20px', boxSizing: 'border-box', margin: '10px', marginTop: '20px', borderRadius: '5px' }}>
                    <label for="district-select">Features</label><br />
                    <select id="district-select" className="mb-4">
                        <option value="">--Select feature--</option>
                        <option value="house">House Districts</option>
                        <option value="senate">Senate Districts</option>
                    </select>


                    <button onClick={() => mapManager.resetZoom()} style={{ backgroundColor: "#ccc", borderRadius: "3px", padding: '10px', fontSize: 'larger', marginTop: '20px' }} id="find-district" type="button">Reset zoom</button>
                </div>


                <div id="form-container" className="overflow-scroll block min-h-auto w-[100%] tablet:min-h-[200px] tablet:max-h-[200px] " style={{ backgroundColor: "rgba(255,255,255,0.9)", zIndex: "1", padding: '20px', boxSizing: 'border-box', margin: '10px', marginTop: "20px", borderRadius: '5px' }}>
                    <Results addresses={addresses} onClick={handleResultClick} groupByField="none" />
                </div>
            </div>

            <div id="map" style={{ flex: 1, width: '100%', height: '100%' }}></div>
        </div >
    );
}




async function handleResultClick(e) {
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

        // Get the selected district type and ID based on the clicked address's data attributes
        const selectedType = getSelectedDistrictType();
        const selectedDistrictId = selectedType === 'senate' ? senate : house;
        const selectedDistrictLabel = (selectedType === 'senate' ? 'S' : 'H') + selectedDistrictId;
        const selectedDistrict = selectedType === 'senate'
            ? districtManager.getSenateDistrict(selectedDistrictId)
            : districtManager.getHouseDistrict(selectedDistrictId);

        if (!selectedDistrict)
        {
            return;
        }
        // Pan and zoom to the district
        const contentCallback = selectedType === 'senate'
            ? () => selectedDistrict.getSenateDistrictInfo()
            : () => selectedDistrict.getHouseDistrictInfo();

        // Shade the selected district and make it clickable to show an info window
        mapManager.shadePolygon(selectedDistrictLabel, selectedType === 'senate' ? '#e55734' : '#2b6cb0');
        await mapManager.makePolygonClickable(selectedDistrictLabel, true, contentCallback, {
            openInfoWindow: true,
            infoWindowPosition: obj
        });
    }
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
async function draw() {

    mapManager = new MapManager();



    function updateLabelVisibility() {
        // Show or hide labels based on the current zoom level and their specified minimum zoom
        const zoomLevel = this.map.getZoom() ?? 0;
        this.currentLabels.forEach((marker, key) => {

            let meta = this.metadata.get(key);
            let minZoom = meta.minZoom;
            let baseText = meta.baseText;

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


    await mapManager.load();
    mapManager.onZoomChange(updateLabelVisibility);


    mapManager.drawDistricts(districtManager.houseDistricts);
    mapManager.drawDistricts(districtManager.senateDistricts);

    mapManager.renderAll();
    mapManager.run(updateLabelVisibility);
}



// Work #3 - Render and rerender.
function render() {

    const select = document.getElementById('district-select');
    const selectedType = getSelectedDistrictType();

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
    shadeSelectedDistricts(selectedType);
    // mapManager.renderZoomFunction((entry) => { entry.minZoom > currentZoomLevel });
}

function shadeSelectedDistricts(selectedType) {
    if (!mapManager)
    {
        return;
    }

    if (selectedType === 'house')
    {
        for (let houseId in latestGroupedByHouse)
        {
            mapManager.shadePolygon('H' + houseId);
        }
    } else if (selectedType === 'senate')
    {
        for (let senateId in latestGroupedBySenate)
        {
            mapManager.shadePolygon('S' + senateId, '#e55734');
        }
    }
}

function getSelectedDistrictType() {
    const select = document.getElementById('district-select');
    if (select && !select.value)
    {
        select.value = 'house';
    }

    return select?.value === 'senate' ? 'senate' : 'house';
}

function getSubmitFunction(setAddresses) {
    return function(event) {
        return onSubmit(event, setAddresses);
    };
}


async function onSubmit(event, setAddresses) {
    event.preventDefault();
    event.stopPropagation();

    const addressInput = document.getElementById('address').value;
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Checking...';


    // Parse addresses
    const input = addressInput.split(/\r?\n/)
        .map(a => new Address(a.trim()))
        .filter(a => a.isValid()); // Filter out invalid addresses



    // Clear previous results (highlights and markers only, keep outlines).
    mapManager.resetPolygons();
    mapManager.clearMarkers();
    districtManager.clearAllAddresses();
    render();


    // Process the addresses, geocoding and finding districts, with caching.
    let addresses = await processAddresses(districtManager, input, addr => { let marker = mapManager.drawMarker(addr); mapManager.renderObject(marker); });



    let groupedByHouse = Object.groupBy(addresses, a => a.house);
    let groupedBySenate = Object.groupBy(addresses, a => a.senate);

    latestGroupedByHouse = groupedByHouse;
    latestGroupedBySenate = groupedBySenate;

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


    const selectedType = getSelectedDistrictType();
    shadeSelectedDistricts(selectedType);


    setAddresses(addresses);
    resultDiv.textContent = '';
}







