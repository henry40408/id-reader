export interface IAppConfig {
  databaseUrl: string;
  env: IAppEnv;
  jwt: IJwtConfig;
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
