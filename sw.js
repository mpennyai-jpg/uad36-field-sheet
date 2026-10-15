/* Pinewood 3.6 Field Sheet - offline cache.
   Bump CACHE on every deploy so the iPad picks up the new build. */
var CACHE = "pinewood-36-field-v89768";
var FILES = [
  "./", "index.html", "manifest.webmanifest",
  "assets/icon-192.png", "assets/icon-512.png", "assets/apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(FILES); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Network first for the page so a deploy lands, cache as the fallback so a
   basement with no signal still opens the app.  Google Fonts are cached
   opportunistically; the app reads fine without them. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.status === 200){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("index.html");
      });
    })
  );
});
