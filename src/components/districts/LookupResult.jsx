


export default function LookupResult(address, houseDistrict, senateDistrict) {
    let addressField = document.createElement('span');
    addressField.textContent = address;
    addressField.classList.add('address-field');

    let houseDistrictField = document.createElement('span');
    houseDistrictField.textContent = houseDistrict;
    houseDistrictField.classList.add('house-district-field');

    let senateDistrictField = document.createElement('span');
    senateDistrictField.textContent = senateDistrict;
    senateDistrictField.classList.add('senate-district-field');

    [addressField, houseDistrictField, senateDistrictField].forEach(field => {
        field.classList.add('table-cell');
    });

    let container = document.createElement('div');
    container.classList.add('table-row');

    container.appendChild(addressField);
    container.appendChild(houseDistrictField);
    container.appendChild(senateDistrictField);

    return container;
}

