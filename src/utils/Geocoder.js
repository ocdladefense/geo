


import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default class Geocoder {
    static async geocodeAddress(address) {

        return await client.geocode({
            params: {
                address: address,
                key: API_KEY //process.env.GOOGLE_MAPS_API_KEY, // Use environment variables for security
            },
            timeout: 1000, // milliseconds
        })
            .then((response) => {
                return response.data.results[0].geometry.location;;
            })
            .catch((error) => {
                console.error(error);
                return null;
            });



    }

}





// User wants to find which district the address is in.
async function getDistrict(type, addressLatLng) {
    if (null == addressLatLng)
    {
        return "Could not geocode address.";
    }
    let search = await fetch(`/kml/${type}/districts?lat=${addressLatLng.lat}&lng=${addressLatLng.lng}`).then(res => res.json());
    console.log('Search results:', search);

    for (let district of search)
    {
        if (await isLatLngInDistrict(addressLatLng, district))
        {
            return district.id;
        }
    }
}



async function geoCodeFromServer(address) {
    return await fetch(`/geocode?address=${encodeURIComponent(address)}`).then(res => res.json());
}

// 1. Geocode the Address (assuming you have a geocoding service or API call)
async function geocodeAddress(address) {
    const geocoder = new google.maps.Geocoder();
    return await new Promise((resolve, reject) => {
        geocoder.geocode({ 'address': address }, (results, status) => {
            if (status === 'OK')
            {
                resolve(results[0].geometry.location); // Returns LatLng object
            } else
            {
                reject('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
}




// Main function to check if address is inside polygon
async function isLatLngInDistrict(addressLatLng, district) {
    try
    {

        const kmlPolygon = new google.maps.Polygon({ paths: district.googleKmlPolygon }); // Load KML polygon for district
        // 4. Use containsLocation()
        return google.maps.geometry.poly.containsLocation(addressLatLng, kmlPolygon);

    } catch (error)
    {
        console.error('Error:', error);
        return false;
    }
}



// module.exports = Geocoder;
