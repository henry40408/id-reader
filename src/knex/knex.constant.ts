import { Inject } from '@nestjs/common';

const KNEX = Symbol();

export function getKnexToken() {
  return KNEX;
}

export function InjectKnex(): ParameterDecorator {
  return Inject(KNEX);
}
