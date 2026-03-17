import { useEffect } from 'react';


export default function AddressSearch({ onSubmit }) {



    return (

        <form id="district-lookup" method="post" onSubmit={onSubmit}>

            <label for="district-select">Features</label><br />
            <select id="district-select" className="mb-4">
                <option value="">--Select feature--</option>
                <option value="house">House Districts</option>
                <option value="senate">Senate Districts</option>
            </select>



            <label style={{ fontSize: 'larger', display: "none" }} htmlFor="address">Enter Address:</label>
            <textarea type="text" style={{ width: "99%", borderRadius: "3px", padding: '10px', fontSize: 'larger' }} id="address" name="address" rows="3" cols="60" placeholder="Enter address" />

            <button style={{ backgroundColor: "#ccc", borderRadius: "3px", padding: '10px', fontSize: 'larger', marginTop: '5px', marginRight: "5px" }} id="find-district" type="submit">Find district</button>


        </form>

    );
}






async function setupFormHandler() {
    // Set up form handler


    const select = document.getElementById('district-select');
    select.addEventListener('change', onDistrictTypeChange);

    const orderCheckbox = document.getElementById('order-by-district');
    orderCheckbox.addEventListener('change', onOrderByDistrictChange);

}



async function onDistrictTypeChange(event) {
    const selectedType = event.target.value === 'senate' ? 'senate' : 'house';
    renderDistrictLayer(selectedType);

    await displayTextResults(
        latestHouseDistrictsWithAddresses,
        latestSenateDistrictsWithAddresses,
        latestAddresses,
        mapManager,
        districtManager,
        selectedType
    );
}

async function onOrderByDistrictChange() {
    const select = document.getElementById('district-select');
    const selectedType = select?.value === 'senate' ? 'senate' : 'house';
    await displayTextResults(
        latestHouseDistrictsWithAddresses,
        latestSenateDistrictsWithAddresses,
        latestAddresses,
        mapManager,
        districtManager,
        selectedType
    );
}
