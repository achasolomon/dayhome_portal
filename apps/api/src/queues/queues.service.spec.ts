import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { QueuesService } from './queues.service';

describe('QueuesService', () => {
  let service: QueuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueuesService,
        { provide: getQueueToken('email'), useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<QueuesService>(QueuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
