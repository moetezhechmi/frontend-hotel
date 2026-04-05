import * as db from './db';
import API_BASE_URL from '../config';

/**
 * Prefetching Strategy for High Traffic (1000+ users)
 * Loads data into IndexedDB before the user even enters the dashboard.
 */
export const prefetchHotelData = async () => {
    const baseUrl = `${API_BASE_URL}/api`;
    
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
