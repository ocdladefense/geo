
import LookupTable from './components/districts/LookupTable.jsx';
import domReady from './utils/domReady.js';


class LegislativeDistrictLookupResult {

    results = {};

    setSenate(address, district) {
        if (!this.results[address])
        {
            this.results[address] = { houseDistrict: null, senateDistrict: null };
        }
        this.results[address].senateDistrict = district;
    }

    setHouse(address, district) {
        if (!this.results[address])
        {
            this.results[address] = { houseDistrict: null, senateDistrict: null };
        }
        this.results[address].houseDistrict = district;
    }

    static from(addresses, houseDistricts, senateDistricts) {
        let result = new LegislativeDistrictLookupResult();
        for (let i = 0; i < addresses.length; i++)
        {
            result.setHouse(addresses[i], houseDistricts[i]);
            result.setSenate(addresses[i], senateDistricts[i]);
        }
        return result;
    }
}


domReady(async function() {
    let form = document.getElementById('district-lookup');
    form.addEventListener('submit', async function(event) {

        let action = event.submitter.id;
        event.preventDefault(); // Prevent form submission.
        event.stopPropagation();
        let addresses = document.getElementById('addresses').value.split(/\r?\n/).map(addr => addr.trim()).filter(addr => addr.length > 0);
        let resultDiv = document.getElementById('result');
        let statusMessage = "Checking...";
        let messages = [];

        resultDiv.textContent = statusMessage;

        let body = { addresses: addresses };
        let houseDistrict = await fetch(`/kml/house/addresses/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => res.json());

        let senateDistrict = await fetch(`/kml/senate/addresses/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => res.json());



        console.log('House Districts:', houseDistrict);
        console.log('Senate Districts:', senateDistrict);


        let results = LegislativeDistrictLookupResult.from(addresses, houseDistrict, senateDistrict);
        resultDiv.appendChild(LookupTable(results));
    });
});

