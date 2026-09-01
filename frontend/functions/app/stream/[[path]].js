export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetPath = url.pathname.replace(/^\/app\/stream/, "") || "/";
  const targetUrl = `https://alphatekx-stream.savemehelp551.workers.dev${targetPath}${url.search}`;
  const newRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  });
  const response = await fetch(newRequest);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("x-proxied-by", "alphatekx-main");
  return newResponse;
}
