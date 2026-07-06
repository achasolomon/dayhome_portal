import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(
    job: Job<{ email: string; token?: string; organizationId?: string }>,
  ): Promise<void> {
    const { email, token } = job.data;

    switch (job.name) {
      case 'send-invite': {
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;
        await this.mailerService.sendMail({
          to: email,
          subject: "You've been invited to join",
          text: `You have been invited to join. Click the link to accept: ${inviteLink}`,
        });
        break;
      }
      default:
        await this.mailerService.sendMail({
          to: email,
          subject: 'BullMQ Test Email',
          text: 'Congratulations! BullMQ and Mailpit are working.',
        });
    }

    console.log(`Email sent to ${email}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    console.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    console.log(`Job ${job.id} failed: ${error.message}`);
  }
}
