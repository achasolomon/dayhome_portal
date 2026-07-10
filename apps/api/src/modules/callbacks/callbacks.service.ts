import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class CallbacksService {
  private readonly logger = new Logger(CallbacksService.name);
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PORTAL_CALLBACK_URL') ?? '';
    this.secret = this.configService.get<string>('INTAKE_WEBHOOK_SECRET') ?? '';
  }

  async notifyStatusUpdate(
    externalId: string,
    status: string,
    reason?: string,
  ): Promise<void> {
    await this.post('/internal/status', {
      externalId,
      status,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyComplianceUpdate(
    externalId: string,
    result: string,
    score: number | null,
    conductedAt: string,
    nextComplianceDue: string,
  ): Promise<void> {
    await this.post('/internal/compliance', {
      externalId,
      result,
      score,
      conductedAt,
      nextComplianceDue,
    });
  }

  async notifyEducatorProfileUpdate(
    externalId: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    await this.put('/internal/educator-profile', {
      externalId,
      ...updates,
    });
  }

  async notifyDocumentUpdate(
    externalId: string,
    documents: Array<{
      name: string;
      fileName: string;
      category: string;
      action: string;
      downloadUrl?: string;
      expiryDate?: string;
    }>,
  ): Promise<void> {
    await this.post('/internal/documents', {
      externalId,
      documents,
    });
  }

  private async post(path: string, body: unknown): Promise<void> {
    await this.send('POST', path, body);
  }

  private async put(path: string, body: unknown): Promise<void> {
    await this.send('PUT', path, body);
  }

  private async send(
    method: string,
    path: string,
    body: unknown,
  ): Promise<void> {
    if (!this.baseUrl) {
      this.logger.warn('PORTAL_CALLBACK_URL not configured, skipping callback');
      return;
    }

    const rawBody = JSON.stringify(body);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', this.secret)
      .update(rawBody)
      .digest('hex');

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Signature: `sha256=${signature}`,
          'X-Timestamp': String(timestamp),
        },
        body: rawBody,
      });

      if (!response.ok) {
        this.logger.warn(
          `Outbound callback ${method} ${path} returned ${response.status}: ${await response.text()}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Outbound callback ${method} ${path} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
