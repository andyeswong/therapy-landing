// Offline sync helper
export async function persistentFetch(url, options) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (e) {
    // Network failed — queue for later sync
    if (options.method === 'POST' || options.method === 'PUT') {
      await queueOfflineRequest(url, options);
    }
    return new Response(JSON.stringify({ ok: true, queued: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function queueOfflineRequest(url, options) {
  const db = await openDB();
  const tx = db.transaction('outbox', 'readwrite');
  tx.objectStore('outbox').add({
    url,
    method: options.method || 'POST',
    body: options.body,
    timestamp: Date.now(),
  });

  // Register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register('sync-queued-requests');
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('citas-ian-db', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Check if online
export function isOnline() {
  return navigator.onLine;
}

// Listen for online/offline events
export function onConnectionChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}
