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
