import { getAuctionHouse } from "../../lib/contracts";
import { Entity, getEntity } from "../../lib/entity";
import { Env } from "../../lib/env";
import { error, json } from "../../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id;
  if (!tokenId || Array.isArray(tokenId) || isNaN(Number(tokenId))) {
    return error(`Invalid tokenId=${tokenId}`, 400);
  }
  const auctionHouse = getAuctionHouse(context.env);
  const [maxTokenId] = await auctionHouse.read.auction();
  const entity = await getEntity(context.env.storage, tokenId);
  const entities: Entity[] = [entity];
  const promises: Promise<void>[] = [];
  for (let id = 0; id < maxTokenId; id++) {
    if (id === Number(tokenId)) continue;
    const promise = (async () => {
      const entity = await getEntity(context.env.storage, id.toString());
      entities.push(entity);
    })();
    promises.push(promise);
  }
  await Promise.all(promises);
  return json({
    healthy: true,
    acceptingUsers: true,
    configurations: {
      networkId: 1,
      globalScenesUrn: [],
      scenesUrn: entities.map(
        (entity) =>
          `urn:decentraland:entity:${entity.id}?=&baseUrl=https://exodus.town/api/contents/`
      ),
      minimap: {
        enabled: false,
      },
      skybox: {
        textures: [],
      },
      realmName: "exouds.town",
    },
    content: {
      healthy: true,
      publicUrl: "https://peer.decentraland.org/content",
    },
    lambdas: {
      healthy: true,
      publicUrl: "https://peer.decentraland.org/lambdas",
    },
    comms: {
      healthy: true,
      protocol: "v3",
      fixedAdapter: "offline:offline",
    },
  });
};
