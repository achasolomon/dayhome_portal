// queues.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  async queueTestEmail(email: string) {
    await this.emailQueue.add(
      'send-test-email',
      { email },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }
}
