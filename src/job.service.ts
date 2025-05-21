import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JOB_METADATA, JobClass } from './job.decorator';

export type JobFunction = (...args: unknown[]) => Promise<unknown>;

@Injectable()
export class JobService implements OnModuleInit {
  private readonly logger = new Logger(JobService.name);

  private readonly jobs = new Map<JobClass, JobFunction>();

  constructor(private readonly discovery: DiscoveryService) {}

  async onModuleInit() {
    const methods = await this.discovery.providerMethodsWithMetaAtKey<JobClass>(JOB_METADATA);
    for (const method of methods) {
      this.jobs.set(method.meta, method.discoveredMethod.handler);
    }
  }

  async runJob(payload: object): Promise<unknown> {
    const jobClass = payload.constructor as JobClass;

    const jobFunction = this.jobs.get(jobClass);
    if (!jobFunction) throw new Error(`Job not found for class: ${jobClass.name}`);

    this.logger.debug(`Running job for class: ${jobClass.name}`);

    return await Promise.resolve(jobFunction(payload)).catch((err) => {
      this.logger.error(err);
      throw err;
    });
  }
}
