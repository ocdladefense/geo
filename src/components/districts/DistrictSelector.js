export function createDistrictSelector() {
   const resultDiv = document.getElementById('result');

   resultDiv.innerHTML = `
        <label for="district-select">Show info for:</label>
        <select id="district-select">
            <option value="">--Select a district--</option>
            <option value="house">House Districts</option>
            <option value="senate">Senate Districts</option>
        </select>
        <div id="district-info" style="margin-top: 10px;"></div>
    `;

    return {
        select: document.getElementById('district-select'),
        infoDiv: document.getElementById('district-info')
    };
}
