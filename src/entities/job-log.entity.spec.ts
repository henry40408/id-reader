import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OrmModule } from '../orm/orm.module';
import { JobLogEntity } from '.';

describe('JobLog entity', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
    }).compile();
    em = moduleRef.get(EntityManager);

    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should create a successful job log entry', async () => {
    const jobLog = new JobLogEntity();
    jobLog.name = 'Test Job';
    jobLog.externalId = '123';
    jobLog.status = 'ok';
    jobLog.payload = { type: 'ok', result: 'success' };

    await em.fork().persist(jobLog).flush();

    const found = await em.findOneOrFail(JobLogEntity, { id: jobLog.id });

    expect(found.name).toEqual(jobLog.name);
    expect(found.externalId).toEqual(jobLog.externalId);
    expect(found.status).toEqual(jobLog.status);
    expect(found.payload).toEqual(jobLog.payload);
  });

  it('should create a failed job log entry', async () => {
    const jobLog = new JobLogEntity();
    jobLog.name = 'Test Job';
    jobLog.externalId = '456';
    jobLog.status = 'err';
    jobLog.payload = { type: 'err', error: 'failure' };

    await em.fork().persist(jobLog).flush();

    const found = await em.findOneOrFail(JobLogEntity, { id: jobLog.id });

    expect(found.name).toEqual(jobLog.name);
    expect(found.externalId).toEqual(jobLog.externalId);
    expect(found.status).toEqual(jobLog.status);
    expect(found.payload).toEqual(jobLog.payload);
  });

  it('should not allow duplicate job log entries with the same name and externalId', async () => {
    const jobLog1 = new JobLogEntity();
    jobLog1.name = 'Duplicate Job';
    jobLog1.externalId = '789';
    jobLog1.status = 'ok';
    jobLog1.payload = { type: 'ok', result: 'first' };

    const jobLog2 = new JobLogEntity();
    jobLog2.name = 'Duplicate Job';
    jobLog2.externalId = '789';
    jobLog2.status = 'err';
    jobLog2.payload = { type: 'err', error: 'second' };

    await em.fork().persist(jobLog1).flush();

    await expect(em.fork().persist(jobLog2).flush()).rejects.toThrow('SQLITE_CONSTRAINT: UNIQUE constraint failed');
  });
});
