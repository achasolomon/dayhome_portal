import { Controller, Get } from '@nestjs/common';

import { QueuesService } from '../queues/queues.service';

@Controller({ path: 'mail', version: '1' })
export class MailController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get('queue-test')
  async queueTest() {
    await this.queuesService.queueTestEmail('test@example.com');

    return {
      message: 'Job queued',
    };
  }
}
