export interface AppConfig {
  databaseUrl: string;
  env: AppEnv;
}

export interface AppEnv {
  development: boolean;
  test: boolean;
  production: boolean;
}
