export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    return await context.next();
  }

  try {
    let actualUrlStr = decodeURIComponent(url.pathname.replace("/", ""));
    actualUrlStr = ensureProtocol(actualUrlStr, url.protocol);
    actualUrlStr += url.search;

    const newHeaders = filterHeaders(request.headers, name => !name.startsWith('cf-'));

    const modifiedRequest = new Request(actualUrlStr, {
      headers: newHeaders,
      method: request.method,
      body: request.body,
      redirect: 'manual'
    });

    const response = await fetch(modifiedRequest);
    let body = response.body;

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = new URL(response.headers.get('location'));
      const modifiedLocation = `/${encodeURIComponent(location.toString())}`;
      const hd = new Headers(response.headers);
      hd.set('Location', modifiedLocation);
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: hd
      });
    }

    if (response.headers.get("Content-Type")?.includes("text/html")) {
      const originalText = await response.text();
      const origin = new URL(actualUrlStr).origin;
      const regex = new RegExp('((href|src|action)=["\'])/(?!/)', 'g');
      const modifiedText = originalText.replace(regex, `$1${url.protocol}//${url.host}/${origin}/`);
      body = modifiedText;
    }

    const modifiedResponse = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    modifiedResponse.headers.set('Cache-Control', 'no-store');
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

    return modifiedResponse;

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

function ensureProtocol(url, defaultProtocol) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : defaultProtocol + "//" + url;
}

function filterHeaders(headers, filterFunc) {
  return new Headers([...headers].filter(([name]) => filterFunc(name)));
}
