import MapManager from '../../utils/MapManager.js';
import DistrictManager from '../../utils/DistrictManager.js';
import { buildHouseTable, buildSenateTable } from './DistrictTable.js';
import { createDistrictSelector } from './DistrictSelector.js';
import { attatchTableRowListeners } from './DistrictRowListener.js';


// Display text results for both house and senate districts 
export function displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses) {
    const mapManager = MapManager.getInstance();
    const districtManager = new DistrictManager();

    // Create the district selector dropdown and info div
    const { select, infoDiv } = createDistrictSelector();

    select.addEventListener('change', function() {
        const selectedValue = this.value;

        // Reset all polygons to unshaded state
        mapManager.resetPolygons();
        infoDiv.innerHTML = '';

        if (selectedValue === 'house')
        {
            // Display house district info and shade those house districts on the map
            infoDiv.innerHTML = buildHouseTable(houseDistrictsWithAddresses);

            houseDistrictsWithAddresses.forEach(district => {
                // Shade the polygon
                mapManager.shadePolygon(mapManager.getPolygonType('house', district.id));
                // Make it clickable
                mapManager.makePolygonClickable(
                    mapManager.getPolygonType('house', district.id),
                    true,
                    (event) => district.getHouseDistrictInfo(event.latLng, districtManager)
                );
            });

            attatchTableRowListeners(houseDistrictsWithAddresses, 'house', mapManager);
        } else if (selectedValue === 'senate')
        {
            // Display senate district info and shade those senate districts on the map
            infoDiv.innerHTML = buildSenateTable(senateDistrictsWithAddresses);
            senateDistrictsWithAddresses.forEach(district => {
                // Shade the polygon
                mapManager.shadePolygon(mapManager.getPolygonType('senate', district.id));
                // Make it clickable
                mapManager.makePolygonClickable(
                    mapManager.getPolygonType('senate', district.id),
                    true,
                    (event) => district.getSenateDistrictInfo(event.latLng, districtManager)
                );
            });

            attatchTableRowListeners(senateDistrictsWithAddresses, 'senate', mapManager);
        }
    });
}
