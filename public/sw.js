const swlog = (...msg) => console.log('[Service Worker]', ...msg);
const appShellCacheName = 'appshell-v001';
const dynamicCacheName = 'dynamic-v001';

async function setupAppShellCache() {
    const appShellCache = await caches.open(appShellCacheName);
    //swlog('Pre-caching app shell static files');
    return appShellCache.addAll(
        [
        '/',
        '/index.html',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
        '/src/js/material.min.js',
        '/src/js/promise.js',
        '/src/js/fetch.js',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/help/index.html',
        '/help/',
        //'/help', // '/help' is not working, apparently because http-server
                   // redirects it to '/help/'
                   // Response-Type (in cache-storage->dynamic) is opaqueredirect
        '/src/css/help.css',
        '/favicon.ico',
        '/src/images/main-image-lg.jpg',
        '/src/images/main-image-sm.jpg',
        '/src/images/main-image.jpg',
        '/manifest.json',
    ]);
}

self.addEventListener('install', function(event) {
    //swlog('Installing Service Worker...', event);
    event.waitUntil(setupAppShellCache());
    //self.skipWaiting();
});

async function deleteStaleCaches() {
    const keyList = await caches.keys();
    return Promise.all(
        keyList.map(key => {
             if (key != appShellCacheName && key != dynamicCacheName) {
                //swlog('Removing old cache...', key);
                return caches.delete(key);
             }
        })
    );
}

self.addEventListener('activate', function(event) {
    //swlog('Activating Service Worker...', event);
    event.waitUntil(deleteStaleCaches());
    return self.clients.claim();
});

async function getResource(request) {
    try {
        const resFromCache = await caches.match(request);
        if (resFromCache) {
            //swlog('found in cache: ', request.url);
            return resFromCache;
        }

        const resFromNet = await fetch(request);
        //swlog('after fetch', request.url);
        dynamicCache = await caches.open(dynamicCacheName);
        //swlog('after dynamic cache open', request.url);
        dynamicCache.put(request.url, resFromNet.clone());
        //swlog('after put in dynamic cache', request.url);
        return resFromNet;
    }
    catch (err) {
        // Ignore
    }
}

self.addEventListener('fetch', function(event) {
    //swlog('Fetching url ', event.request.url);
    event.respondWith(getResource(event.request));
});