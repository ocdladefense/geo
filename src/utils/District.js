/**
 * @class District
 * A class representing a legislative district, with methods for determining whether a point is within the district.
 * The constructor takes an array of coordinates in the format [longitude, latitude] and calculates the northernmost, southernmost, westernmost, and easternmost points of the district.
 */

const THE_DIVIDE = -121.443;


// Create a function that can test for whether a point is in Eastern Oregon.
// There are only 6 districts here.
function getIsEasternOregonTest(longitude) {

    return function(latLng) {
        return latLng[1] >= THE_DIVIDE;
    }
}


// const isEasternOregon = getIsEasternOregonTest(THE_DIVIDE);



// Separate out districts into regions.
// This allows us to optimize the search by only checking
// districts in the relevant region first.
const urban = [10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];

const southernOregon = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 56];

const easternOregon = [53, 54, 55, 57, 58, 59, 60]; // Add districts as needed

export let districts = [];




export default class District {

    id;

    coords;

    // The northernmost point of the district.
    northPoint;

    // The southernmost point of the district.
    southPoint;

    // The westernmost point of the district.
    westPoint;

    // The easternmost point of the district.
    eastPoint;

    // The coordinates as a Google KML Polygon.
    googleKmlPolygon;

    type; // "house" or "senate"

    // Addresses that fall within this district.
    addresses = [];

    // @todo not necessary.
    representative = null;

    // @todo not necessary.
    senator = null;


    constructor(coords, id) {
        this.id = id;
        this.coords = coords[0]; // In Oregon district boundaries are contiguous, so we can use the first set of coordinates for the main polygon. If there were multiple polygons (e.g., islands), we would need to check all of them. 

        // this.googleKmlPolygon = District.getAsGoogleKmlPolygon(this.coords);
        this.northPoint = District.getNorthernmostPoint(this.coords);
        this.southPoint = District.getSouthernmostPoint(this.coords);
        this.westPoint = District.getWesternmostPoint(this.coords);
        this.eastPoint = District.getEasternmostPoint(this.coords);
    }




    isOutside(coords) {

        let lat = coords[1];
        let lng = coords[0];

        // If the point if north of the northernmost point or south of the southernmost point,
        // it can't be within this district.
        return lat > this.northPoint[0] || lat < this.southPoint[0] || lng < this.westPoint[1] || lng > this.eastPoint[1];
    }



    static getAsGoogleKmlPolygon(coords) {
        return coords.map(coord => {
            return { lat: coord[1], lng: coord[0] };
        });
    }



    // Convert coords to LatLng objects for Google Maps
    getCoordsAsObjects() {
        // Convert [lng, lat] to {lat: lat, lng: lng}
        return this.coords.map(p => ({ lat: p[1], lng: p[0] }));
    }


    static getNorthernmostPoint(coords) {

        const findMaxLatitudePoint = (accumulator, currentValue) => {
            let [lng, lat] = currentValue;
            let [accLng, accLat] = accumulator;
            return lat > accLat ? currentValue : accumulator;
        };

        let rfc7946coords = coords.reduce(findMaxLatitudePoint);

        return [rfc7946coords[1], rfc7946coords[0]];
    }


    static getSouthernmostPoint(coords) {

        const findMinLatitudePoint = (accumulator, currentValue) => {
            let [lng, lat] = currentValue;
            let [accLng, accLat] = accumulator;
            return lat < accLat ? currentValue : accumulator;
        };

        let rfc7946coords = coords.reduce(findMinLatitudePoint);

        return [rfc7946coords[1], rfc7946coords[0]];
    }


    static getWesternmostPoint(coords) {

        const findMinLongitudePoint = (accumulator, currentValue) => {
            let [lng, lat] = currentValue;
            let [accLng, accLat] = accumulator;
            return lng < accLng ? currentValue : accumulator;
        };

        let rfc7946coords = coords.reduce(findMinLongitudePoint);

        return [rfc7946coords[1], rfc7946coords[0]];
    }

    static getEasternmostPoint(coords) {

        const findMaxLongitudePoint = (accumulator, currentValue) => {
            let [lng, lat] = currentValue;
            let [accLng, accLat] = accumulator;
            return lng > accLng ? currentValue : accumulator;
        };

        let rfc7946coords = coords.reduce(findMaxLongitudePoint);

        return [rfc7946coords[1], rfc7946coords[0]];
    }



    static intersect(arr1, arr2) {
        // The filter() method creates a new array with all elements 
        // that pass the test implemented by the provided function.
        const commonElements = arr1.filter(element => {
            // The includes() method determines whether an array 
            // includes a certain value among its entries, returning true or false.
            return arr2.includes(element);
        });

        return commonElements;
    }




    // Build info window content for this district
    async getHouseDistrictInfo() {
        const addressList = this.addresses.map(addr => `&bull; ${addr.address}`);

        return `
            <div><strong>House District ${this.id}</strong><br>
            <b>Address(es):</b><br>${addressList.join('<br>')}<br><br>
            ${this.representative ? `<b>Representative: </b>${this.representative.FirstName} ${this.representative.LastName}<br>${this.representative.Party}<br>${this.representative.EmailAddress}<br><br>` : ''}
            </div>
        `;
    }

    async getSenateDistrictInfo() {
        const addressList = this.addresses.map(addr => `&bull; ${addr.address}`);

        return `
            <div><strong>Senate District ${this.id}</strong><br>
            <b>Address(es):</b><br>${addressList.join('<br>')}<br><br>
            ${this.senator ? `<b>Senator: </b>${this.senator.FirstName} ${this.senator.LastName}<br>${this.senator.Party}<br>${this.senator.EmailAddress}<br><br>` : ''}
            </div>
        `;
    }



    // Add an address to this district
    addAddress(address) {
        this.addresses.push(address);
    }

    addAddresses(addresses) {
        this.addresses.push(...addresses);
    }

    // Clear all addresses from this district
    clearAddresses() {
        this.addresses = [];
    }

    // Check if this district has any addresses
    hasAddresses() {
        return this.addresses.length > 0;
    }

    // Get the number of addresses in this district
    getAddressCount() {
        return this.addresses.length;
    }


}








function isUrban(point) {

    let southernDistrict = districts[9]; // District 10 is urban southernmost
    let southernMostPoint = District.getSouthernMostPoint(southernDistrict);
    let easternMostPoint = District.getEasternMostPoint(southernDistrict);

    if (point.lat() >= southernMostPoint[1] && point.lng() <= easternMostPoint[0])
    {
        return true;
    } else
    {
        return false;
    }
}

function isEasternOregon(point) {

    let easternDistrict = districts[54]; // Example: District 55 is in Eastern Oregon
    let westernMostPoint = District.getWesternMostPoint(easternDistrict);




    if (point.lng() > westernMostPoint[0])
    {
        return true;
    } else
    {
        return false;
    }
}

function isSouthernOregon(point) {
    let northernDistrict = districts[11]; // Example: District 12 is in Southern Oregon
    let easternMostPoint = District.getEasternMostPoint(northernDistrict);

    if (point.lat() < easternMostPoint[1])
    {
        return true;
    } else
    {
        return false;
    }
}

// Determine starting quadrant based on address location
export function getStartQuadrant(point) {
    // Determine which region the point is in
    let nums;
    // Return array of district numbers in that region
    if (isEasternOregon(point)) nums = easternOregon;
    else if (isSouthernOregon(point)) nums = southernOregon;
    else nums = urban;
    // Map district numbers to district objects
    return nums.map(n => districts[n - 1]);
}

// Get remaining districts not in starting quadrant
export function remainingDistricts(startQuadrant) {
    // Get district numbers in starting quadrant
    let startDistrictNums = startQuadrant.map(d => districts.indexOf(d) + 1);
    // Get all district numbers
    let allDistrictNums = districts.map((d, i) => i + 1);
    // Return district numbers not in starting quadrant
    return allDistrictNums.filter(n => !startDistrictNums.includes(n));
}


async function doClientCode() {
    // Geocode right away so we can determine which quadrant to start the district search in.
    let geocodes = await Promise.all(addresses.map(address => geoCodeFromServer(address)));
    // console.log('Geocoded Address LatLng:', addressLatLng);


    for (let i = 0; i < addresses.length; i++)
    {
        if (null == geocodes[i])
        {
            messages.push(`Could not geocode address: "${addresses[i]}"`);
            continue;
        }
        messages.push(`Geocode for address "${addresses[i]}": ${JSON.stringify(geocodes[i])}`);
    }



    for (let i = 0; i < geocodes.length; i++)
    {
        let addressLatLng = geocodes[i];
        if (null == addressLatLng)
        {
            messages.push("House district: null.");
            continue;
        }
        let district = await getDistrict('house', addressLatLng);
        results.setHouse(addresses[i], district);
        // messages.push("House district: " + district);
    }



    for (let i = 0; i < geocodes.length; i++)
    {
        let addressLatLng = geocodes[i];
        if (null == addressLatLng)
        {
            messages.push("Senate district: null.");
            continue;
        }
        let district = await getDistrict('senate', addressLatLng);
        results.setSenate(addresses[i], district);
        // messages.push("Senate district: " + district);
    }

    console.log('Final Results:', results);

}
