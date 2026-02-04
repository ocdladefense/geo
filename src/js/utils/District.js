

const THE_DIVIDE = -121.443;


// Create a function that can test for whether a point is in Eastern Oregon.
// There are only 6 districts here.
function getIsEasternOregonTest(longitude) {

    return function(latLng) {
        return latLng[1] >= THE_DIVIDE;
    }
}


const isEasternOregon = getIsEasternOregonTest(THE_DIVIDE);




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


    constructor(id, coords) {
        this.id = id;
        this.coords = coords;
        this.googleKmlPolygon = District.getAsGoogleKmlPolygon(coords);
        this.northPoint = District.getNorthernmostPoint(coords);
        this.southPoint = District.getSouthernmostPoint(coords);
        this.westPoint = District.getWesternmostPoint(coords);
        this.eastPoint = District.getEasternmostPoint(coords);
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
