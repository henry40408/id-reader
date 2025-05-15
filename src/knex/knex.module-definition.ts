import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IConfigModuleOptions } from './knex.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IConfigModuleOptions>().build();
