if (!window.Promise) {
    window.Promise = Promise;
}

let deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('Service worker registered');
        });
}
else {
    console.log('No serviceWorker in navigator');
}

window.addEventListener('beforeinstallprompt', function(event) {
    console.log('before Chrome install prompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});