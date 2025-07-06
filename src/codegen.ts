import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'generated/schema.gql',
  documents: ['app/**/*.ts', 'app/**/*.vue'],
  generates: {
    './generated/gql/': {
      preset: 'client',
    },
  },
};
export default config;
