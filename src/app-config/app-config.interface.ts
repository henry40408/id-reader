export interface AppConfig {
  databaseUrl: string;
  env: AppEnv;
  jwt: JwtConfig;
}

export interface AppEnv {
  development: boolean;
  test: boolean;
  production: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresInSeconds: number;
}
