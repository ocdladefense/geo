import { buildTable, buildTableByAddress } from './DistrictTable.js';
import { attatchTableRowListeners, attatchTableRowListenersByAddress } from './DistrictRowListener.js';


// Display text results for both house and senate districts 
export async function displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses, addresses, mapManager, districtManager, selectedType) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        return;
    }

    mapManager.resetPolygon();

    // Check if the "Order by District" checkbox is checked
    const orderByDistrict = document.getElementById('order-by-district')?.checked ?? false;

    if (selectedType === 'senate') {
        senateDistrictsWithAddresses.forEach(district => {
            const polygonId = 'S' + district.id;
            mapManager.shadePolygon(polygonId);
            mapManager.makePolygonClickable(
                polygonId,
                true,
                (event) => district.getSenateDistrictInfo(event.latLng, districtManager)
            );
        });
        return;
    }

    // If ordering by district, build the table grouped by house district. Otherwise, build it ordered by address.
    if (orderByDistrict) {
        resultDiv.innerHTML = buildTable(houseDistrictsWithAddresses);
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
    } else {
        // Build table ordered by address
        resultDiv.innerHTML = buildTableByAddress(addresses);
        houseDistrictsWithAddresses.forEach(district => {
            const polygonId = 'H' + district.id;
            mapManager.shadePolygon(polygonId);
            mapManager.makePolygonClickable(
                polygonId,
                true,
                (event) => district.getHouseDistrictInfo(event.latLng, districtManager)
            );
        });
        attatchTableRowListenersByAddress(addresses, 'house', districtManager, mapManager);
    }
}
