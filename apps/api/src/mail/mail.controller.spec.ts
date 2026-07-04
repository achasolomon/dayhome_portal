import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { QueuesService } from '../queues/queues.service';

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        { provide: QueuesService, useValue: { addEmail: jest.fn() } },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
