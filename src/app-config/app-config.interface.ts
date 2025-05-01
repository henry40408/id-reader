export interface IAppConfig {
  databaseUrl: string;
  env: {
    development: boolean;
    test: boolean;
    production: boolean;
  };
  jwt: {
    secret: string;
    expiresInSeconds: number;
  };
}
