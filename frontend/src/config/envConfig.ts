type EnvProperties = {
  apiEndpoint: string;
  websocketEndpoint: string;
  siteEndpoint: string;
  apiBasePath: string;
};

export type EnvConfig = {
  isDev: boolean;
  setProperty: (configKey: keyof EnvProperties, configValue: string) => void;
} & EnvProperties;

const isDev = process.env.NODE_ENV === 'development';
const siteEndpoint = isDev
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_FRONTEND_URL!;

export const envConfig: EnvConfig = {
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
  websocketEndpoint: process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT!,
  siteEndpoint,
  apiBasePath: isDev ? process.env.NEXT_PUBLIC_BASE_URL! : '',
  isDev,
  setProperty(configKey, configValue) {
    this[configKey] = configValue;
  },
};
