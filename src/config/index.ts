import { Env, createConfig } from '@dcl/ui-env'
import dev from './env/dev.json'
import prd from './env/prd.json'

export const config = createConfig(
  {
    [Env.DEVELOPMENT]: dev,
    [Env.PRODUCTION]: prd,
  },
  {
    systemEnvVariables: {
      DCL_DEFAULT_ENV:
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
          ? Env.DEVELOPMENT
          : Env.PRODUCTION,
    },
  }
);
