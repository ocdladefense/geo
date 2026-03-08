import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import express from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = process.cwd()
const router = express.Router();




let serverCache = {
    hits: 0,
    misses: 0,
    results: [],
    variants: {}
};

// Cache API endpoints
router.get("/api/cache", (req, res) => {
    res.json(serverCache);
});

router.post("/api/cache", (req, res) => {
    const { hits, misses, results, variants } = req.body;

    if (hits !== undefined) serverCache.hits = hits;
    if (misses !== undefined) serverCache.misses = misses;
    if (results !== undefined) serverCache.results = results;
    if (variants !== undefined) serverCache.variants = variants;

    console.log(`Cache saved to server. Hits: ${serverCache.hits}, Misses: ${serverCache.misses}, Variants: ${JSON.stringify(serverCache.variants)}`);
    res.json({ success: true, message: 'Cache saved' });
});

export default router;




export async function useCache(key, fn) {
    let filepath = path.join(__dirname, 'dist/cache', key);
    let exists = fs.existsSync(filepath);
    let result;

    console.log(`Cache ${exists ? "hit" : "miss"} for ${filepath}`);

    result = exists ? JSON.parse(fs.readFileSync(filepath, 'utf-8')) : await fn();

    if (!exists)
    {
        fs.writeFileSync(filepath, JSON.stringify(result), 'utf-8');
    }

    return result;
}

