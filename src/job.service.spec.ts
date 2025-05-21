import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { JobService } from './job.service';
import { Job } from './job.decorator';

class TestPayload {
  name!: string;
}

class TestPayload2 {}

@Injectable()
class TestService {
  @Job(TestPayload)
  testMethod(payload: TestPayload) {
    return payload;
  }
}

describe('JobService', () => {
  let moduleRef: TestingModule;
  let service: JobService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [JobService, TestService],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<JobService>(JobService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should run job', async () => {
    const payload = new TestPayload();
    payload.name = 'test';
    await expect(service.runJob(payload)).resolves.toEqual({ name: 'test' });
  });

  it('should throw error if job not found', async () => {
    const payload = new TestPayload2();
    await expect(service.runJob(payload)).rejects.toThrow(`Job not found for class: TestPayload2`);
  });
});
