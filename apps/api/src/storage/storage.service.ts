import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService {
  private readonly client: Minio.Client;

  constructor(private readonly config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT')!,
      port: Number(this.config.get('MINIO_PORT')),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.config.get<string>('MINIO_SECRET_KEY')!,
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const bucket = this.config.get<string>('MINIO_BUCKET')!;

    const fileName = `${Date.now()}-${file.originalname}`;

    await this.client.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    return {
      fileName,
      bucket,
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType?: string,
  ): Promise<{ fileName: string; bucket: string }> {
    const bucket = this.config.get<string>('MINIO_BUCKET')!;

    await this.client.putObject(bucket, fileName, buffer, buffer.length, {
      'Content-Type': contentType ?? 'application/octet-stream',
    });

    return { fileName, bucket };
  }
}
