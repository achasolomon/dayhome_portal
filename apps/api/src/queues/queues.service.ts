import { Injectable } from '@nestjs/common';
import { InjectQueue, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
    @InjectQueue('dead-letter')
    private readonly deadLetterQueue: Queue,
  ) {}

  @OnWorkerEvent('failed')
  async onFailed(job: Job<Record<string, unknown>>, error: Error) {
    await this.deadLetterQueue.add('email-failed', {
      originalJobId: job.id,
      data: job.data,
      error: error.message,
    });
  }

  async queueTestEmail(email: string) {
    await this.emailQueue.add(
      'send-test-email',
      {
        email,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }
}
