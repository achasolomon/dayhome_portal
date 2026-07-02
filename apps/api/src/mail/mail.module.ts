import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [QueuesModule],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
