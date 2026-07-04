import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { Sequelize } from 'sequelize-typescript';
import { RedisService } from '../redis/redis.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: Sequelize, useValue: { authenticate: jest.fn() } },
        {
          provide: RedisService,
          useValue: { ping: jest.fn().mockResolvedValue('PONG') },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
