


export default class Address {


    address; // Original address string

    location; // { lat: number, lng: number } - LatLng object

    formattedAddress = null; // Cached formatted address from reverse geocoding

    zip; // ZIP code extracted from formatted address (optional)

    static geocoder;

    // Integer.
    house;

    // Integer.
    senate;

    constructor(address, location, district) {
        this.address = address; // Store original address string
        this.location = location; // Store LatLng object
        this.zip = this.extractZip(address);
    }


    // Check if the address is valid (non-empty string)
    isValid() {
        if (this.address.length === 0)
        {
            return false;
        }
        return true;
    }


    // Extract ZIP code from address string    
    extractZip(address) {
        const zipMatch = address.match(/\b\d{5}\b/);
        return zipMatch ? zipMatch[0] : null;
    }
    // Get formatted address (with caching)
    async getFormattedAddress() {
        // Return cached formatted address if available
        if (this.formattedAddress)
        {
            return this.formattedAddress;
        }

        try
        {
            // Perform reverse geocoding to get formatted address
            this.formattedAddress = await Address.reverseGeocode(
                this.location.lat(),
                this.location.lng()
            );
            return this.formattedAddress;
        } catch (error)
        {
            console.error('Reverse geocoding failed:', error);
            return this.address; // Fallback to original input
        }
    }

    // Static method to geocode an address string to LatLng
    geocode() {
        if (!Address.geocoder)
        {
            Address.geocoder = new google.maps.Geocoder();
        }
        // Wrap the geocoding in a Promise
        return new Promise((resolve, reject) => {
            // Geocode the address string
            Address.geocoder.geocode({ address: this.address }, (results, status) => {
                if (status === 'OK')
                {
                    resolve(results[0].geometry.location);
                } else
                {
                    reject('Geocode failed: ' + status);
                }
            });
        }).then(location => {
            this.location = location;
            return this;
        });
    }

    // Static method to reverse geocode LatLng to formatted address
    static async reverseGeocode(lat, lng) {
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
        return await new Promise((resolve, reject) => {
            Address.geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0])
                {
                    resolve(results[0].formatted_address);
                } else
                {
                    reject('Reverse geocode failed: ' + status);
                }
            });
        });
    }

    // Create an Address by geocoding an address string
    static async fromString(addressString, district) {
        const location = await Address.geocode(addressString);
        return new Address(addressString, location, district);
    }
}
