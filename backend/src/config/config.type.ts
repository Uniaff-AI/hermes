export interface AppConfig {
  app: {
    port: number;
    environment: string;
    name: string;
  };
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
    ttl: number;
    password?: string;
  };
  phpBackend: {
    baseUrl: string;
    apiToken: string;
    timeout: number;
    retries: number;
  };
  queue: {
    redis: {
      host: string;
      port: number;
      password?: string;
    };
    defaultJobOptions: {
      removeOnComplete: number;
      removeOnFail: number;
    };
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}
