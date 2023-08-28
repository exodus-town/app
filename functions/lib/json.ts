export function json(body: object) {
  const response = new Response(JSON.stringify(body, null, 2));
  response.headers.set("Content-Type", "application/json");
  return response;
}
