import * as db from './db';

/**
 * Prefetching Strategy for High Traffic (1000+ users)
 * Loads data into IndexedDB before the user even enters the dashboard.
 */
export const prefetchHotelData = async () => {
    const baseUrl = `http://${window.location.hostname}:3001/api`;
    
    const prefetch = async (url, key) => {
        try {
            console.log(`📡 Prefetching ${key}...`);
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                const freshData = data.items || data.services || data.activities || data.experiences || [];
                await db.setItem(`cache_${key}`, freshData);
                console.log(`✅ ${key} cached.`);
            }
        } catch(e) {
            console.warn(`❌ Prefetch failed for ${key} (Offline?)`);
        }
    };

    // Standard Promise.all for parallel fetching
    return Promise.all([
        prefetch(`${baseUrl}/menu`, 'menu'),
        prefetch(`${baseUrl}/internal-services`, 'internal_services'),
        prefetch(`${baseUrl}/activities`, 'activities'),
        prefetch(`${baseUrl}/experiences`, 'experiences')
    ]);
};
