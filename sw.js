var CACHE_NAME = 'json-endpoint-diff-v1';
var urlsToCache = [
  '/jsondiff/index.html',
  '/jsondiff/app.bundle.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because we want to use the request to cache and fetch for the browser
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          function(response) {
            // check if we received a valid request
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response because we want to cache the response and send response to the browser
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  )
})
