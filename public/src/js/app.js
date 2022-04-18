if (!window.Promise) {
    window.Promise = Promise;
    // When Promise is not there, it is doubtful async-await syntax would be there.
    // So, the below async-await code will not work.
}

(async function() {
    if ('serviceWorker' in navigator) {
        try {
            const swRegistration = await navigator.serviceWorker.register('/sw.js');
            //console.log('Service worker registered', swRegistration);
            console.log('Service worker registered');
        } catch(err) {
            console.log('Service worker registration failed');
        }
    }
    else {
        console.log('Service workers unsupported in the browser');
    }
})();

let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(event) {
    console.log('before Chrome install prompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});