import District from './District.js';





class DistrictManager {



    static instance = null; // Singleton instance

    //districts = []; // Array to hold District objects

    loaded = false; // Flag to prevent multiple loads

    houseDistricts = []; // Separate array for house districts (1-60)

    senateDistricts = []; // Separate array for senate districts (1-30)



    constructor() { }



    // Load district boundaries from GeoJSON and create District objects
    async loadDistricts() {
        if (this.loaded) return;
        // Fetch GeoJSON data for Oregon House Districts
        const data = await fetch('/data/geo/House_Districts.geojson').then(r => r.json());

        const features = data.features;
        // Create District objects for each feature
        for (let i = 1; i <= 60; i++)
        {
            const districtCoords = features[i - 1].geometry.coordinates;
            const district = new District(districtCoords, i);
            district.type = 'house'; // Label as house district
            // console.log('Loaded house district ' + i);

            this.houseDistricts.push(district);
        }
        // Load senate districts (1-30)
        const senateData = await fetch('/data/geo/Senate_Districts.geojson').then(r => r.json());
        for (let i = 1; i <= 30; i++)
        {
            const districtCoords = senateData.features[i - 1].geometry.coordinates;
            const district = new District(districtCoords, i);
            district.type = 'senate'; // Label as senate district
            // console.log('Loaded senate district ' + i);

            this.senateDistricts.push(district);
        }

        console.log('Loaded district boundaries');
        // Mark as loaded to prevent future reloads
        this.loaded = true;
    }

    // Load representatives data and associate with districts
    async loadRepresentatives() {
        const data = await fetch('/legislators/representatives').then(r => r.json());
        this.loadLegislators(data, 'house');
        console.log('Loaded representatives data');
    }

    // Load senators data and associate with districts
    async loadSenators() {
        const data = await fetch('/legislators/senators').then(r => r.json());

        this.loadLegislators(data, 'senate');
        console.log('Loaded senators data');

    }

    loadLegislators(data, type) {

        let store = type + "Districts";

        data.forEach(rep => {
            const districtNum = rep.DistrictNumber;
            // Associate representative with the correct district (1-60)
            const district = this[store][districtNum - 1];

            district.legislator = rep;
            // Check if the representative is in a house or senate district and log it
            // console.log('This representative is in a house district');
            // console.log('Representative ' + district.representative.FirstName + ' ' + district.representative.LastName + ' is in district ' + districtNum);
        });
    }

    // Get all districts
    getAllDistricts() {
        return this.houseDistricts.concat(this.senateDistricts);
    }

    // Get a house district by ID and type
    getHouseDistrict(id) {
        return this.houseDistricts[id - 1];
    }

    // Get a senate district by ID and type
    getSenateDistrict(id) {
        return this.senateDistricts[id - 1];
    }

    // Find the district for a given location
    findHouseDistrict(location) {
        const lat = location.lat();
        const lng = location.lng();

        // Filter by bounding box first (optimization)
        const possibles = this.houseDistricts.filter(d => !d.isOutside([lng, lat]));

        // Check each possible district
        for (let district of possibles)
        {
            if (this.isLocationInDistrict(location, district))
            {
                return district.id;
            }
        }

        return null;
    }

    // Find the senate district for a given location
    findSenateDistrict(location) {
        const lat = location.lat();
        const lng = location.lng();

        // Filter by bounding box first (optimization)
        const possibles = this.senateDistricts.filter(d => !d.isOutside([lng, lat]));

        // Check each possible district
        for (let district of possibles)
        {
            if (this.isLocationInDistrict(location, district))
            {
                return district.id;
            }
        }

        return null;
    }

    // Check if a location is inside a district polygon
    isLocationInDistrict(location, district) {
        try
        {
            // Create a polygon from the district's coordinates and check if the location is inside it
            const polygon = new google.maps.Polygon({
                paths: district.getCoordsAsObjects()
            });
            // Use the geometry library to check if the location is inside the polygon
            return google.maps.geometry.poly.containsLocation(location, polygon);
        } catch (error)
        {
            console.error('Error checking location:', error);
            return false;
        }
    }

    // Clear all addresses from all districts
    clearAllAddresses() {
        this.houseDistricts.forEach(d => d.clearAddresses());
        this.senateDistricts.forEach(d => d.clearAddresses());
    }

    // Get districts that have addresses
    getHouseDistrictsWithAddresses() {
        return this.houseDistricts.filter(d => d.hasAddresses());
    }

    // Get senate districts that have addresses
    getSenateDistrictsWithAddresses() {
        return this.senateDistricts.filter(d => d.hasAddresses());
    }

}

export default DistrictManager; 
