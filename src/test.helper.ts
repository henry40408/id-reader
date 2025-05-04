import { ConfigModuleOptions } from './knex/knex.interface';

export const knexConfig: ConfigModuleOptions = {
  knex: {
    client: 'sqlite',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: true,
  },
};
