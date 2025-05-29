import { SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export const JOB_METADATA = Symbol();

export type JobClass = ClassConstructor<unknown>;

export const Job = (cls: JobClass) => SetMetadata(JOB_METADATA, cls);
