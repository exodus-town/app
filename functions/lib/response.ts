export function json(body: object) {
  const response = new Response(JSON.stringify(body, null, 2));
  response.headers.set("Content-Type", "application/json");
  return response;
}

export function error(message: string, status: number) {
  const response = new Response(JSON.stringify({ error: message }, null, 2), {
    status,
  });
  response.headers.set("Content-Type", "application/json");
  return response;
}
