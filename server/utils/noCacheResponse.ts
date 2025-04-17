export function createNoCacheHeaders() {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Netlify-CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
}