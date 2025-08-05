export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;

  externalApis: {
    leads: {
      url: string;
      apiKey: string;
      timeout: number;
    };
    products: {
      url: string;
      apiKey: string;
      timeout: number;
    };
    affiliate: {
      url: string;
      apiKey: string;
      timeout: number;
    };
  };
};
