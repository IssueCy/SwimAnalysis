const CACHE = "RaceAnalysis-v1.3.1";

const FILES = [
    "./index.html",
    "./",
    "./manifest.json",

    "./css/mainStyles.css",

    "./script/mainScript.js",

    "./libs/jspdf.umd.min.js",
    "./libs/jspdf.plugin.autotable.min.js",
    "./libs/chart.umd.js",

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

    if (event.request.mode === "navigate") {

        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match("./index.html"))
        );

        return;
    }


    event.respondWith(
        caches.match(event.request)
            .then(response => {

                return response || fetch(event.request);

            })
    );

});