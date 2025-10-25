// Service Worker to handle HTTPS requests to mixed-content backend
self.addEventListener('fetch', (event) => {
  // Intercept API calls and handle them
  if (event.request.url.includes('/api/')) {
    // For development: allow mixed content by proxying through service worker
    const url = new URL(event.request.url);
    
    // If it's already an absolute URL to EC2, let it through
    if (url.hostname === '98.80.12.149') {
      event.respondWith(
        fetch(event.request, {
          mode: 'no-cors',
          credentials: 'include'
        }).catch(err => {
          console.error('Service Worker fetch error:', err);
          return new Response('Network error', { status: 503 });
        })
      );
    }
  }
});
