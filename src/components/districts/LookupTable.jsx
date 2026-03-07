import LookupResult from './LookupResult.jsx';

export default function LookupTable(results) {

    let table = document.createElement('div');
    table.classList.add('table');
    table.classList.add('table-bordered');
    table.classList.add('table-striped');
    table.classList.add('table-hover');

    let labelRow = document.createElement('div');
    labelRow.classList.add('table-row');

    let addressLabel = document.createElement('span');
    addressLabel.textContent = "Address";

    let houseDistrictLabel = document.createElement('span');
    houseDistrictLabel.textContent = "House District";

    let senateDistrictLabel = document.createElement('span');
    senateDistrictLabel.textContent = "Senate District";

    [addressLabel, houseDistrictLabel, senateDistrictLabel].forEach(label => {
        label.classList.add('table-cell');
        label.style.fontWeight = 'bold';
        label.style.fontSize = 'larger';
    });

    labelRow.appendChild(addressLabel);
    labelRow.appendChild(houseDistrictLabel);
    labelRow.appendChild(senateDistrictLabel);
    table.appendChild(labelRow);

    let rows = Object.entries(results.results).map(([address, districts]) => {
        return LookupResult(address, districts.houseDistrict, districts.senateDistrict);
    });
    rows.forEach(row => table.appendChild(row));

    return table;
}
