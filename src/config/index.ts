import { Env, createConfig } from "@dcl/ui-env";
import dev from "./env/dev.json";
import prd from "./env/prd.json";

export const config = createConfig(
  {
    [Env.DEVELOPMENT]: dev,
    [Env.PRODUCTION]: prd,
  },
  {
    systemEnvVariables: {
      DCL_DEFAULT_ENV: Env.PRODUCTION,
    },
  }
);
