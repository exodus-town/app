interface Env {
  storage: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const obj = await context.env.storage.get("logo.png");
  return new Response(obj.body);
};
