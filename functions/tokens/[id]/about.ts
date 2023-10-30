import { getEntity } from "../../lib/entity";
import { Env } from "../../lib/env";
import { error, json } from "../../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id;
  if (!tokenId || Array.isArray(tokenId)) {
    return error(`Invalid tokenId=${tokenId}`, 400);
  }
  const entity = await getEntity(context.env.storage, tokenId);
  return json({
    healthy: true,
    acceptingUsers: true,
    configurations: {
      networkId: 1,
      globalScenesUrn: [],
      scenesUrn: [
        `urn:decentraland:entity:${entity.id}?=&baseUrl=https://exodus.town/api/contents`,
      ],
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
      publicUrl: "https://exodus.town/api/contents",
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
