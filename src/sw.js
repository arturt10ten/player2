const CACHE_NAME = "dynamic_cache";
self.addEventListener("fetch", function(event) {
    event.respondWith(
        (async () => {
            let url = new URL(event.request.url);
            if (url.pathname.startsWith("/api/")) {
                return await fetch(event.request);
            }
            url.search = "";
            let req = new Request(url, { ...event.request });
            let response = await caches.match(req);
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
