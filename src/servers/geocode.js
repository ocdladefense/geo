import express from 'express';
import { fileURLToPath } from 'url';
import Geocoder from '../utils/Geocoder.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = process.cwd()
const router = express.Router();






router.get("/geocode", async (req, res) => {

    let address = req.query.address;
    let coords = await Geocoder.geocodeAddress(address);
    console.log(`Geocode for address "${address}":`, coords);
    res.json(coords);
});

export default router;
