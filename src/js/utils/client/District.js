// Separate out districts into regions.
// This allows us to optimize the search by only checking
// districts in the relevant region first.
const urban = [10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];

const southernOregon = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 56];

const easternOregon = [53, 54, 55, 57, 58, 59, 60]; // Add districts as needed

export let districts = [];


export default class District {

    // District number (1-60)
    id; // h16 = house district 16. Keep track of district based on id for shading and info windows
    type; // "house" or "senate"
    westPoint;
    eastPoint;
    southPoint;
    northPoint;
    addresses = [];
    representative = null;
    senator = null;

    constructor(coords, id) {
        this.id = id;
        this.coords = coords[0]; // In Oregon district boundaries are contiguous, so we can use the first set of coordinates for the main polygon. If there were multiple polygons (e.g., islands), we would need to check all of them. 
        // Precalculate bounding box points for performance
        this.westPoint = District.getWesternMostPoint(this.coords);
        this.eastPoint = District.getEasternMostPoint(this.coords);
        this.southPoint = District.getSouthernMostPoint(this.coords);
        this.northPoint = District.getNorthernMostPoint(this.coords);

        // console.log('District bounding box: W:' + this.westPoint + ' E:' + this.eastPoint + ' S:' + this.southPoint + ' N:' + this.northPoint);
    }

    // Convert coords to LatLng objects for Google Maps
    getCoordsAsObjects() {
        // Convert [lng, lat] to {lat: lat, lng: lng}
        return this.coords.map(p => ({ lat: p[1], lng: p[0] }));
    }


    // Returns the westernmost point of the district 
    static getWesternMostPoint(coords) {
        // Get western most longitude point
        // return district.westernMostPoint;

        // Get western most longitude point
        const westernMostPoint = coords.reduce((westernPoint, currentPoint) => {
            let lng1 = westernPoint[0];
            let lng2 = currentPoint[0];
            return lng1 < lng2 ? westernPoint : currentPoint;
        });

        return westernMostPoint;
    }

    static getEasternMostPoint(coords) {
        // Get eastern most longitude point
        const easternMostPoint = coords.reduce((easternPoint, currentPoint) => {
            return currentPoint[0] > easternPoint[0] ? currentPoint : easternPoint;
        });
        return easternMostPoint;
    }

    static getSouthernMostPoint(coords) {
        const southernMostPoint = coords.reduce((southernPoint, currentPoint) => {
            return currentPoint[1] < southernPoint[1] ? currentPoint : southernPoint;
        });
        return southernMostPoint;
    }

    static getNorthernMostPoint(coords) {
        const northernMostPoint = coords.reduce((northernPoint, currentPoint) => {
            return currentPoint[1] > northernPoint[1] ? currentPoint : northernPoint;
        });
        return northernMostPoint;
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

    // Check if a given coordinate is outside the bounding box of this district
    isOutside(coords) {

        let lat = coords[1];
        let lng = coords[0];

        // If the point if north of the northernmost point or south of the southernmost point,
        // it can't be within this district.
        return lat > this.northPoint[1] || lat < this.southPoint[1] || lng < this.westPoint[0] || lng > this.eastPoint[0];
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
