/**
 * https://expressjs.com/en/starter/hello-world.html
 * OpenID: https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_using_openid.htm&type=5
 * So we can extract some user information.
 */

import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import Geocoder from '../utils/Geocoder.js';



const app = express();
const port = process.env.PORT || 80;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



import authRoutes from './auth.js';
import districtRoutes from './district.js';
import legislatorsRoutes from './legislators.js';

app.use('/', authRoutes);
app.use('/', districtRoutes);
app.use('/', legislatorsRoutes);



console.log(process.cwd());

let serverCache = {
    hits: 0,
    misses: 0,
    results: [],
    variants: {}
};

// Serve static files from the 'dist' directory
app.use(cors());
app.use(express.static('dist'));
app.use(cookieParser());
app.use(express.json());




// Cache API endpoints
app.get("/api/cache", (req, res) => {
    res.json(serverCache);
});

app.post("/api/cache", (req, res) => {
    const { hits, misses, results, variants } = req.body;

    if (hits !== undefined) serverCache.hits = hits;
    if (misses !== undefined) serverCache.misses = misses;
    if (results !== undefined) serverCache.results = results;
    if (variants !== undefined) serverCache.variants = variants;

    console.log(`Cache saved to server. Hits: ${serverCache.hits}, Misses: ${serverCache.misses}, Variants: ${JSON.stringify(serverCache.variants)}`);
    res.json({ success: true, message: 'Cache saved' });
});



app.get("/geocode", async (req, res) => {

    let address = req.query.address;
    let coords = await Geocoder.geocodeAddress(address);
    console.log(`Geocode for address "${address}":`, coords);
    res.json(coords);
});




// Define a route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});




// Define a route to serve index.html
app.all('/{*any}', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});




// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
