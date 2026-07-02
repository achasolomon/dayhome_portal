import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { QueuesService } from './queues.service';
import { EmailProcessor } from './processors/email.processor/email.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'dead-letter',
      },
    ),
  ],
  providers: [QueuesService, EmailProcessor],
  exports: [QueuesService, BullModule],
})
export class QueuesModule {}
