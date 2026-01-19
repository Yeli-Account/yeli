export default {
  async fetch(request, env, ctx) {
    
    return new Response(await import('./index.html?raw'), {
      headers: { 'content-type': 'text/html' }
    });
  }
}

