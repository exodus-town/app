export type About = {
  healthy: boolean;
  acceptingUsers: boolean;
  configurations: {
    networkId: number;
    globalScenesUrn: string[];
    cityLoaderContentServer: string;
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

export async function getAbout(): Promise<About> {
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
