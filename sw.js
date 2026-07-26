const CACHE = "RaceAnalysis-v1.2";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/mainStyles.css",
    "./script/mainScript.js",
    "./assets/simtec_logo.png",
    "./assets/1570889.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => {
                return cache.addAll(FILES);
            })
    );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});