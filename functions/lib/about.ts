import { getEntityMappings } from "./entity";
import { Env } from "./env";

export type About = {
  healthy: boolean;
  acceptingUsers: boolean;
  configurations: {
    networkId: number;
    globalScenesUrn: string[];
    scenesUrn?: string[];
    cityLoaderContentServer?: string;
    minimap: {
      enabled: boolean;
    };
    skybox: {
      fixedHour: number;
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

export function getAbout(): About {
  return {
    healthy: true,
    acceptingUsers: true,
    configurations: {
      networkId: 1,
      globalScenesUrn: [],
      cityLoaderContentServer: "https://exodus.town/api",
      minimap: {
        enabled: false,
      },
      skybox: {
        fixedHour: 36000,
      },
      realmName: "exodus.town",
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
        "signed-login:https://worlds-content-server.decentraland.org/get-comms-adapter/world-prd-exodustown.dcl.eth",
    },
  };
}

export async function getUrns(env: Env, tokenId: string = "0") {
  const mappings = await getEntityMappings(env);
  const entities = Object.values(mappings);
  // sort scenes by distance to the target parcel
  const target = mappings[tokenId];
  entities.sort((a, b) => {
    const dist1 = Math.abs(target.x - a.x) + Math.abs(target.y - a.y);
    const dist2 = Math.abs(target.x - b.x) + Math.abs(target.y - b.y);
    return dist1 > dist2 ? 1 : -1;
  });
  // map urns
  return entities.map(
    (entity) =>
      `urn:decentraland:entity:${entity.hash}?=&baseUrl=https://exodus.town/api/contents/`
  );
}
