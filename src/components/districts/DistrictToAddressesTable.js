import { buildTable, buildTableByAddress } from './DistrictTable.js';
import { attatchTableRowListeners, attatchTableRowListenersByAddress } from './DistrictRowListener.js';


// Display text results for both house and senate districts 
export async function displayTextResults(houseDistrictsWithAddresses, senateDistrictsWithAddresses, addresses, mapManager, districtManager, selectedType) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv)
    {
        return;
    }

    mapManager.resetPolygon();

    // Check if the "Order by District" checkbox is checked
    const orderByDistrict = document.getElementById('order-by-district')?.checked ?? false;

    const districtsWithAddresses = selectedType === 'senate'
        ? senateDistrictsWithAddresses
        : houseDistrictsWithAddresses;
    const polygonPrefix = selectedType === 'senate' ? 'S' : 'H';
    const districtInfoGetter = selectedType === 'senate'
        ? (district, event) => district.getSenateDistrictInfo(event.latLng, districtManager)
        : (district, event) => district.getHouseDistrictInfo(event.latLng, districtManager);

    if (orderByDistrict)
    {
        resultDiv.innerHTML = buildTable(districtsWithAddresses, selectedType);
        attatchTableRowListeners(districtsWithAddresses, selectedType, mapManager);
    } else
    {
        resultDiv.innerHTML = buildTableByAddress(addresses);
        attatchTableRowListenersByAddress(addresses, selectedType, districtManager, mapManager);
    }

    districtsWithAddresses.forEach(district => {
        const polygonId = polygonPrefix + district.id;
        mapManager.shadePolygon(polygonId);
        mapManager.makePolygonClickable(
            polygonId,
            true,
            (event) => districtInfoGetter(district, event)
        );
    });
}


