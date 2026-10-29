import { getEntityMappings } from "./entity";
import { Env } from "./env";
import { toLayout } from "./layout";
import { getClient, getTownToken } from "./contracts";

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
    map?: {
      minimapEnabled: boolean;
      sizes: { left: number; right: number; top: number; bottom: number }[];
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

// `origin` is the site serving this realm (its contents API lives under /api).
export function getAbout(origin: string): About {
  return {
    healthy: true,
    acceptingUsers: true,
    configurations: {
      networkId: 1,
      globalScenesUrn: [],
      cityLoaderContentServer: `${origin}/api`,
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

export async function getUrns(
  env: Env,
  origin: string,
  tokenId: string = "0"
) {
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
      `urn:decentraland:entity:${entity.hash}?=&baseUrl=${origin}/api/contents/`
  );
}

let townBounds: Promise<{ left: number; right: number; top: number; bottom: number }> | undefined;

/**
 * The parcels every minted plot covers. The web explorer (bevy-explorer) only requests scenes from
 * `cityLoaderContentServer` inside the regions in `configurations.map.sizes`, so a realm without
 * them loads nothing. Plots are no longer minted once the auction house is paused, so this is
 * computed once per isolate.
 */
export function getTownBounds(env: Env) {
  townBounds ??= getClient(env)
    .readContract({ ...getTownToken(env), functionName: "totalSupply" })
    .then((supply) => {
      const bounds = { left: Infinity, right: -Infinity, top: -Infinity, bottom: Infinity };
      for (let id = 0; id < Number(supply); id++) {
        for (const { x, y } of toLayout(id).parcels) {
          bounds.left = Math.min(bounds.left, x);
          bounds.right = Math.max(bounds.right, x);
          bounds.bottom = Math.min(bounds.bottom, y);
          bounds.top = Math.max(bounds.top, y);
        }
      }
      return bounds;
    })
    .catch((error) => {
      townBounds = undefined;
      throw error;
    });
  return townBounds;
}
