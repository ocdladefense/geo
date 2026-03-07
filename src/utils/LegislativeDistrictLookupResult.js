


export default class LegislativeDistrictLookupResult {

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

