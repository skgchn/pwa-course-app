const swlog = (...msg) => console.log('[Service Worker]', ...msg);
const appShellCacheName = 'appshell-v001';
const dynamicCacheName = 'dynamic-v001';
const offlinePage = '/offline.html';

async function setupAppShellCache() {
    try {
        const appShellCache = await caches.open(appShellCacheName);
        //swlog('Pre-caching app shell static files');
        return appShellCache.addAll([
            '/',
            '/index.html',
            offlinePage,
            'https://fonts.googleapis.com/css?family=Roboto:400,700',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
            '/src/js/material.min.js',
            '/src/js/material.min.js.map',
            '/src/js/promise.js',
            '/src/js/fetch.js',
            '/src/js/app.js',
            '/src/js/feed.js',
            '/src/css/app.css',
            '/src/css/feed.css',
            //'/help/index.html',
            //'/help/',
            //'/help', // '/help' is not working, apparently because http-server
                    // redirects it to '/help/'
                    // Response-Type (in cache-storage->dynamic) is opaqueredirect
            //'/src/css/help.css',
            '/favicon.ico',
            '/src/images/icons/app-icon-144x144.png',
            '/src/images/main-image-lg.jpg',
            '/src/images/main-image-sm.jpg',
            '/src/images/main-image.jpg',
            '/manifest.json',
        ]);
    } catch(err) {
        // Do nothing
    }
}

self.addEventListener('install', event => {
    //swlog('Installing service worker');
    event.waitUntil(setupAppShellCache());
    //self.skipWaiting();
});

async function deleteStaleCaches() {
    const cacheNameList = await caches.keys();
    return Promise.all(
        cacheNameList.map(cacheName => {
             if (cacheName != appShellCacheName && cacheName != dynamicCacheName) {
                //swlog('Removing old cache', cacheName);
                return caches.delete(cacheName);
             }
        })
    );
}

self.addEventListener('activate', event => {
    //swlog('Activating service worker');
    event.waitUntil(deleteStaleCaches());
    return self.clients.claim();
});

async function getResource(request) {
    try {
        const resFromCache = await caches.match(request);
        if (resFromCache) {
            //swlog('Found in cache', request.url);
            return resFromCache;
        }

        //swlog('Fetching resource from net', request.url);
        const resFromNet = await fetch(request);
        //swlog('Opening dynamic cache to save the resource', request.url);
        const dynamicCache = await caches.open(dynamicCacheName);
        //swlog('Saving resouce in dynamic cache', request.url);
        await dynamicCache.put(request.url, resFromNet.clone());
        return resFromNet;
    }
    catch (err) {
        appShellCache = await caches.open(appShellCacheName);
        return appShellCache.match(offlinePage);
    }
}

self.addEventListener('fetch', event => {
    //swlog('Fetching url', event.request.url);
    event.respondWith(getResource(event.request));
});
