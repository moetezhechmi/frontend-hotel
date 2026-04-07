import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import API_BASE_URL from './config.js';

// Global Fetch Interceptor for Silent Token Refresh
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    let [resource, config] = args;
    
    // Perform original fetch
    let response = await originalFetch(resource, config);
    
    // Check if unauthorized and not already refreshing to prevent infinite loops
    if ((response.status === 401 || response.status === 403) && typeof resource === 'string' && !resource.includes('/api/refresh')) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('adminRefreshToken') || localStorage.getItem('clientRefreshToken');
        if (refreshToken) {
            try {
                const refreshRes = await originalFetch(API_BASE_URL + '/api/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });
                const refreshData = await refreshRes.json();
                
                if (refreshData.success) {
                    // Decide where to put the new token
                    if (localStorage.getItem('adminToken') && refreshData.token) {
                        localStorage.setItem('adminToken', refreshData.token);
                        localStorage.setItem('adminRefreshToken', refreshData.refreshToken);
                    } else if (localStorage.getItem('clientToken') && refreshData.token) {
                        localStorage.setItem('clientToken', refreshData.token);
                        localStorage.setItem('clientRefreshToken', refreshData.refreshToken);
                    }
                    
                    // Update auth header for original config and retry
                    if (config && config.headers && config.headers['Authorization']) {
                        config.headers['Authorization'] = `Bearer ${refreshData.token}`;
                    } else if (config) {
                        config.headers = {
                            ...config.headers,
                            'Authorization': `Bearer ${refreshData.token}`
                        };
                    } else {
                        config = { headers: { 'Authorization': `Bearer ${refreshData.token}` } };
                    }
                    
                    // Retry original request
                    return originalFetch(resource, config);
                } else {
                    // Refresh failed significantly (token expired)
                    // Let the UI handle 401
                }
            } catch (err) {
                // Ignore refresh network errors and just return original response
            }
        }
    }
    return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
