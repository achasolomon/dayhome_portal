import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendTestEmail() {
    await this.mailer.sendMail({
      to: 'test@example.com',
      subject: 'SPICED Mail Test',
      html: `
        <h1>Hello from SPICED</h1>
        <p>Mailpit is working successfully.</p>
      `,
    });

    return {
      success: true,
      message: 'Email sent',
    };
  }
}
