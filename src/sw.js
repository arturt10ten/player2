const CACHE_NAME = "dynamic_cache";
self.addEventListener("fetch", function(event) {
    event.respondWith(
        (async () => {
            let response = await caches.match(event.request);
            if (response) {
                return response;
            }
            let url = new URL(event.request.url);
            if (url.pathname.startsWith("/api/")) {
            }
            url.search = "";
            let req = new Request(url, { ...event.request });
            response = await caches.match(req);
            if (response) {
                return response;
            }
            var fetchRequest = req.clone();
            response = await fetch(fetchRequest);
            if (
                !response ||
                response.status !== 200 ||
                response.type !== "basic"
            ) {
                return response;
            }
            var responseToCache = response.clone();
            let cache = await caches.open(CACHE_NAME);
            await cache.put(req, responseToCache);
            return response;
        })(),
    );
});
