



export default class Cache {

    hits;

    misses;

    results;

    variants;

    static META_KEY = 'district_cache_stats';

    // A cache key that corresponds to multiple values.
    // Expectation is that a single cache key correspond to a single value.
    variants;



    constructor() {
        this.hits = 0;
        this.misses = 0;
        this.results = new Map(); // Store results with zipcode as key
        this.variants = {}; // Store variant data keyed by zipcode
        this.STATS_KEY = Cache.META_KEY; // Key for storing stats
    }

    // Load cache results and stats from localStorage
    static loadFromLocalStorage() {

        let cache = new Cache();


        try
        {
            // Load all items from localStorage that match cache pattern
            for (let i = 0; i < localStorage.length; i++)
            {
                const key = localStorage.key(i);
                // Skip stats key, load everything else as cache entries
                if (key && key !== this.STATS_KEY && !key.startsWith('district_cache_stats'))
                {
                    const stored = localStorage.getItem(key);
                    if (stored)
                    {
                        const parsed = JSON.parse(stored);
                        cache.results.set(key, parsed);
                    }
                }
            }

            // Load previous stats, if any.
            const stats = localStorage.getItem(this.STATS_KEY);
            if (stats)
            {
                const { hits, misses } = JSON.parse(stats);
                cache.hits = hits || 0;
                cache.misses = misses || 0;
            }
        } catch (e)
        {
            console.error('Error loading cache from localStorage:', e);
        }
        return cache;
    }


    // This loader will work in the context of Node and Express server.
    static loadFromDisk() {


    }

    // Save a single cache entry to localStorage
    saveToLocalStorage() {
        // Save all cache entries to localStorage
        this.results.forEach((result, zipcode) => {
            if (zipcode && result)
            {
                localStorage.setItem(zipcode, JSON.stringify(result));
            }
        });

        // Save stats
        localStorage.setItem(this.STATS_KEY, JSON.stringify({
            hits: this.hits,
            misses: this.misses
        }));
    }

    // Get number of cache hits
    getHits() {
        return this.hits;
    }

    // Get number of cache misses
    getMisses() {
        return this.misses;
    }

    // Look up a result by zipcode
    lookup(zipcode) {
        if (!zipcode) return null; // Guard against undefined zip


        // Check if we have a cached entry for this ZIP
        const cached = this.results.get(zipcode);

        if (this.variants[zipcode] || !cached)
        {
            this.misses++;
            return null;
        }


        this.hits++;
        // this.saveToLocalStorage(zipcode, cached);
        return cached;

    }

    // Store a result in the cache
    put(addr) {
        if (!addr.zip)
        {
            console.warn('Address has no ZIP, skipping cache store:', addr.address);
            return;
        }

        // Create single cache entry for this zipcode
        const store = {
            zipcode: addr.zip,
            house: addr.house,
            senate: addr.senate
        };


        // Check for variant data.
        let existing = this.results.get(addr.zip);


        if (!!existing)
        {

            let sameHouse = existing.house === store.house;
            let sameSenate = existing.senate === store.senate;
            // Remove it from the results map;

            if (!sameHouse || !sameSenate)
            {

                // this.results.delete(addr.zip);
                // We have a variant! Store it in the variants map.

                if (!this.variants[addr.zip])
                {
                    this.variants[addr.zip] = [];
                }
                this.variants[addr.zip].push(store);
            }
            // Add it to the variants map.

        }
        // Store in memory Map
        this.results.set(addr.zip, store);
    }

    // Get all cached results
    getResults() {
        return Array.from(this.results.values());
    }

    // Clear the cache and reset stats
    clear() {
        this.results.clear();
        this.hits = 0;
        this.misses = 0;

        // Remove all cache entries from localStorage
        for (let i = localStorage.length - 1; i >= 0; i--)
        {
            const key = localStorage.key(i);
            if (key && key !== this.STATS_KEY)
            {
                localStorage.removeItem(key);
            }
        }
        localStorage.removeItem(this.STATS_KEY);
    }
}


