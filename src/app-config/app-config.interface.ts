export interface IAppConfig {
  databaseUrl: string;
  env: IAppEnv;
  jwt: IJwtConfig;
  uploads: string;
}

export interface IAppEnv {
  development: boolean;
  test: boolean;
  production: boolean;
}

export interface IJwtConfig {
  secret: string;
  expiresInSeconds: number;
}
