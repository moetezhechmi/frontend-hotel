/**
 * Optimized IndexedDB Utility for Hotel Platform
 * Handles high-volume caching (Menu, Activities, etc.) efficiently.
 */
const DB_NAME = 'HariClubDB';
const DB_VERSION = 2;


export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('notifications')) {
                db.createObjectStore('notifications', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const setItem = async (key, value) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('cache', 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.put({ key, value, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getItem = async (key) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('cache', 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
};

export const saveNotif = async (notif) => {
    const db = await initDB();
    const transaction = db.transaction('notifications', 'readwrite');
    transaction.objectStore('notifications').put({ ...notif, timestamp: notif.timestamp || Date.now() });
};

export const getNotifs = async () => {
    const db = await initDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('notifications', 'readonly');
        const store = transaction.objectStore('notifications');
        const request = store.getAll();
        request.onsuccess = () => {
            const limit = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const valid = request.result.filter(n => (n.timestamp || 0) > limit);
            resolve(valid.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
        };
    });
};

