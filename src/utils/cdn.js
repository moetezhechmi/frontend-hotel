/**
 * CDN Transformer for Hotel Assets
 * Optimized images for 1000+ simultaneous users by using a CDN proxy strategy.
 * This dramatically reduces the load on the hotel's server for large assets.
 */
const CDN_ENABLED = false; // Disabled at user's request
const CDN_BASE_URL = 'https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_800/'; // Placeholder CDN

export const transformImageUrl = (url) => {
    if (!url || !CDN_ENABLED) return url;
    
    // If it's a relative URL, prepend the host
    const absoluteUrl = url.startsWith('http') ? url : `${window.location.protocol}//${window.location.host}${url}`;
    
    // Don't wrap if it's already a CDN URL (or similar)
    if (url.includes('cloudinary') || url.includes('unsplash') || url.includes('localhost') || url.includes('192.168.')) return url;

    return `${CDN_BASE_URL}${encodeURIComponent(absoluteUrl)}`;
};
