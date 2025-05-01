import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '../dtos';
import { UserRepository } from '../repositories/user.repository';
import { testKnexModule } from '../test.helper';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let moduleRef: TestingModule;
  let repository: UserRepository;
  let service: AuthService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule, JwtModule.register({ global: true, secret: 'secret' }), AuthModule],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<UserRepository>(UserRepository);
    service = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user', async () => {
    await repository.create({ username: 'test', password: 'test' });
    const user = await service.validate({ username: 'test', password: 'test' });
    expect(user).toBeDefined();
  });

  it('should not validate user', async () => {
    await repository.create({ username: 'test', password: 'test' });
    const user = await service.validate({ username: 'test', password: 'wrong' });
    expect(user).toBeUndefined();
  });

  it('should sign JSON web token', async () => {
    const user = await repository.create({ username: 'test', password: 'test' });

    const token = service.sign({ sub: user.id, username: user.username });
    expect(token).toBeDefined();

    const jwtService = moduleRef.get<JwtService>(JwtService);
    const payload = jwtService.verify<JwtPayload>(token);
    expect(payload).toBeDefined();
    expect(payload.sub).toBe(user.id);
    expect(payload.username).toBe(user.username);
  });
});
