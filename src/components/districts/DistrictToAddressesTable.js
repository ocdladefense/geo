import { buildHouseTable, buildSenateTable } from './DistrictTable.js';
import { attatchTableRowListeners } from './DistrictRowListener.js';


// Display text results for both house and senate districts 
export async function displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses, mapManager, districtManager, selectedType) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        return;
    }

    mapManager.resetPolygons();

    if (selectedType === 'senate') {
        resultDiv.innerHTML = buildSenateTable(senateDistrictsWithAddresses);
        senateDistrictsWithAddresses.forEach(district => {
            const polygonId = 'S' + district.id;
            mapManager.shadePolygon(polygonId);
            mapManager.makePolygonClickable(
                polygonId,
                true,
                (event) => district.getSenateDistrictInfo(event.latLng, districtManager)
            );
        });
        attatchTableRowListeners(senateDistrictsWithAddresses, 'senate', mapManager);
        return;
    }

    resultDiv.innerHTML = buildHouseTable(houseDistrictsWithAddresses);
    houseDistrictsWithAddresses.forEach(district => {
        const polygonId = 'H' + district.id;
        mapManager.shadePolygon(polygonId);
        mapManager.makePolygonClickable(
            polygonId,
            true,
            (event) => district.getHouseDistrictInfo(event.latLng, districtManager)
        );
    });
    attatchTableRowListeners(houseDistrictsWithAddresses, 'house', mapManager);
}
