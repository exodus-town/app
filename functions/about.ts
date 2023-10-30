import { getAuctionHouse } from "./lib/contracts";
import { Env } from "./lib/env";
import { Path, getContentPath, getMutableHash } from "./lib/mappings";
import { json } from "./lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auctionHouse = getAuctionHouse(context.env);
  const [tokenId] = await auctionHouse.read.auction();
  const entities: string[] = [];
  const promises: Promise<void>[] = [];
  for (let id = 0; id < tokenId; id++) {
    const promise = (async () => {
      const hash = await getMutableHash(id.toString(), Path.ENTITY);
      const path = getContentPath(hash);
      const exists = await context.env.storage.head(path);
      if (exists) {
        entities.push(hash);
      }
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
        (id) =>
          `urn:decentraland:entity:${id}?=&baseUrl=https://exodus.town/api/contents/`
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
      fixedAdapter:
        "signed-login:https://worlds-content-server.decentraland.org/get-comms-adapter/world-prd-monotributista.dcl.eth",
    },
  });
};
