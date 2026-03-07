import MapManager from '../../utils/MapManager.js';
import DistrictManager from '../../utils/DistrictManager.js';
import { buildHouseTable, buildSenateTable } from './DistrictTable.js';
import { createDistrictSelector } from './DistrictSelector.js';
import { attatchTableRowListeners } from './DistrictRowListener.js';


// Display text results for both house and senate districts 
export function displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses) {
    const mapManager = new MapManager();
    const districtManager = new DistrictManager();

    // Create the district selector dropdown and info div
    const { select, infoDiv } = createDistrictSelector();

    const setupDistrictPolygons = (districtType, districts, buildTableFunc, getInfoFunc) => {
        infoDiv.innerHTML = buildTableFunc(districts);
        
        // Determine polygon key prefix based on district type
        const polygonPrefix = districtType === 'house' ? 'H' : 'S';
        
        // Shade polygons for the relevant districts and make them clickable
        districts.forEach(district => {
            const polygonId = polygonPrefix + district.id;
            
            mapManager.shadePolygon(polygonId);
            mapManager.makePolygonClickable(
                polygonId,
                true,
                (event) => getInfoFunc(district, event.latLng, districtManager)
            );
        });

        attatchTableRowListeners(districts, districtType, mapManager);
    };

    select.addEventListener('change', function() {
        const selectedValue = this.value;
        
        // Reset all polygons to unshaded state
        mapManager.resetPolygons();
        infoDiv.innerHTML = '';
        
        if (selectedValue === 'house') {
            setupDistrictPolygons('house', houseDistrictsWithAddresses, buildHouseTable, (district, latLng, dm) => district.getHouseDistrictInfo(latLng, dm));
        } else if (selectedValue === 'senate') {
            setupDistrictPolygons('senate', senateDistrictsWithAddresses, buildSenateTable, (district, latLng, dm) => district.getSenateDistrictInfo(latLng, dm));
        }
    });
}
