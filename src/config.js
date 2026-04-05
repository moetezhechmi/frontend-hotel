const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:3001` : 'https://backend-hotel-production-a5cf.up.railway.app');

export default API_BASE_URL;
