import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  process(job: Job): Promise<void> {
    console.log('Processing', job.id);
    return Promise.resolve();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed: ${error.message}`);
  }
}
