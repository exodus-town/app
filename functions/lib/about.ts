import { getAuctionHouse } from "./contracts";
import { Entity, getEntity } from "./entity";
import { Env } from "./env";

export type About = {
  healthy: boolean;
  acceptingUsers: boolean;
  configurations: {
    networkId: number;
    globalScenesUrn: string[];
    scenesUrn: string[];
    minimap: {
      enabled: boolean;
    };
    skybox: {
      textures: string[];
    };
    realmName: string;
  };
  content: {
    healthy: boolean;
    publicUrl: string;
  };
  lambdas: {
    healthy: boolean;
    publicUrl: string;
  };
  comms: {
    healthy: boolean;
    protocol: string;
    fixedAdapter: string;
  };
};

export async function getAbout(
  env: Env,
  tokenId: string = "0"
): Promise<About> {
  const auctionHouse = getAuctionHouse(env);
  const [maxTokenId] = await auctionHouse.read.auction();
  const promises: Promise<Entity>[] = [getEntity(env.storage, tokenId)];
  for (let id = 0; id < maxTokenId; id++) {
    if (id === Number(tokenId)) continue;
    promises.push(getEntity(env.storage, id.toString()));
  }
  const entities = await Promise.all(promises);
  await Promise.all(promises);
  return {
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
      fixedAdapter:
        "signed-login:https://worlds-content-server.decentraland.org/get-comms-adapter/world-prd-monotributista.dcl.eth",
    },
  };
}
