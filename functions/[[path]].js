export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return await context.next();
  }

  try {
    let target = decodeURIComponent(url.pathname.slice(1));
    if (!target.startsWith('http')) {
      target = 'https://' + target;
    }
    target += url.search;

    const headers = new Headers(request.headers);
    for (const key of [...headers.keys()]) {
      if (key.toLowerCase().startsWith('cf-')) {
        headers.delete(key);
      }
    }

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual'
    });

    const newHeaders = new Headers(res.headers);

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = newHeaders.get('location');
      if (loc) {
        newHeaders.set('location', '/' + encodeURIComponent(loc));
      }
      return new Response(res.body, {
        status: res.status,
        headers: newHeaders
      });
    }

    if (newHeaders.get('content-type')?.includes('text/html')) {
      let text = await res.text();
      const origin = new URL(target).origin;
      const myHost = url.host;
      const proto = url.protocol;
      text = text.replace(/((href|src|action)=["'])\//g, `$1${proto}//${myHost}/${origin}/`);
      newHeaders.set('content-type', 'text/html; charset=utf-8');
      return new Response(text, {
        status: res.status,
        headers: newHeaders
      });
    }

    return new Response(res.body, {
      status: res.status,
      headers: newHeaders
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
}
