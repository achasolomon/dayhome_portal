import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';

@Injectable()
export class IntakeSignatureGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      rawBody?: Buffer;
      headers: Record<string, string | string[] | undefined>;
    }>();

    const signatureHeader = request.headers['signature'] as string | undefined;
    const timestampHeader = request.headers['x-timestamp'] as
      string | undefined;

    if (!signatureHeader || !timestampHeader) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
        message: 'Missing Signature or X-Timestamp header.',
      });
    }

    // Replay protection — reject requests older than 5 minutes
    const timestamp = parseInt(timestampHeader, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(timestamp) || now - timestamp > 300 || now < timestamp) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
        message: 'X-Timestamp is invalid or expired.',
      });
    }

    const secret = this.configService.get<string>('INTAKE_WEBHOOK_SECRET');
    if (!secret) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
        message: 'Webhook secret not configured.',
      });
    }

    // HMAC verification
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
        message: 'Request body is required for signature verification.',
      });
    }

    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

    try {
      const sigBuffer = Buffer.from(signatureHeader);
      const expectedBuffer = Buffer.from(expected);
      if (sigBuffer.length !== expectedBuffer.length) {
        throw new UnauthorizedException({
          code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
          message: 'Signature mismatch.',
        });
      }
      if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
        throw new UnauthorizedException({
          code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
          message: 'Signature mismatch.',
        });
      }
    } catch {
      throw new UnauthorizedException({
        code: ERROR_CODES.INTAKE_SIGNATURE_INVALID,
        message: 'Signature mismatch.',
      });
    }

    return true;
  }
}
