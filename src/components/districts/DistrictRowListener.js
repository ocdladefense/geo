export function attatchTableRowListeners(districts, districtType, mapManager) {
    // Add click listeners only to the addresses cell (3rd column) of each row
    document.querySelectorAll('#result table tbody tr').forEach((row, index) => {
        const addressesCell = row.querySelector('td.addresses-cell');
        if (!addressesCell) return;
        addressesCell.addEventListener('click', async () => {
            // Get the corresponding district for this row
            const district = districts[index];
            const methodName = districtType === 'house' ? 'getHouseDistrictInfo' : 'getSenateDistrictInfo';
            const infoContent = await district[methodName]();
            mapManager.zoomToFeature(district);
            
            const infoWindow = new google.maps.InfoWindow({ content: infoContent });
            // Center on the district
            const bounds = new google.maps.LatLngBounds();
            district.getCoordsAsObjects().forEach(coord => bounds.extend(coord));
            infoWindow.setPosition(bounds.getCenter());
            infoWindow.open({ map: mapManager.getMap() });
        });
    });
}

// Similar to above but for tables ordered by address instead of district
export function attatchTableRowListenersByAddress(addresses, districtType, districtManager, mapManager) {
    document.querySelectorAll('#result table tbody tr').forEach((row, index) => {
        const addressesCell = row.querySelector('td.addresses-cell');
        
        // Add click listener to the addresses cell
        addressesCell.addEventListener('click', async () => {
            const addr = addresses[index];
            const district = districtType === 'senate'
                ? districtManager.getSenateDistrict(addr.senate)
                : districtManager.getHouseDistrict(addr.house);
            if (!district) return;
            const methodName = districtType === 'house' ? 'getHouseDistrictInfo' : 'getSenateDistrictInfo';
            const infoContent = await district[methodName]();
            mapManager.zoomToFeature(district);
            // Center on the district
            const infoWindow = new google.maps.InfoWindow({ content: infoContent });
            const bounds = new google.maps.LatLngBounds();
            district.getCoordsAsObjects().forEach(coord => bounds.extend(coord));
            infoWindow.setPosition(bounds.getCenter());
            infoWindow.open({ map: mapManager.getMap() });
        });
    });
}
