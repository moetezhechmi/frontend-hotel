const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:3001` : 'https://backend-hotel-production-a5cf.up.railway.app');

export const VAPID_PUBLIC_KEY = 'BB4IDQiWoXayZ_-Paf2Z1YudSXhOk2-6SqopNU47zNqpIKDv-M5h1DuTwm7arnLWgvry1LJtDVAlCwB_tY7R9LM';
export default API_BASE_URL;
