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
import cacheRoutes from './cache.js';
import geocodeRoutes from './geocode.js';
import authRoutes from './auth.js';
import districtRoutes from './district.js';
import legislatorsRoutes from './legislators.js';


const app = express();
const port = process.env.PORT || 80;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log(process.cwd());


// Serve static files from the 'dist' directory
app.use('/', cacheRoutes);
app.use('/', geocodeRoutes);
app.use('/', authRoutes);
app.use('/', districtRoutes);
app.use('/', legislatorsRoutes);
app.use(cors());
app.use(express.static('dist'));
app.use(cookieParser());
app.use(express.json());







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
