import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { StorageService } from './storage.service';

@Controller({ path: 'storage', version: '1' })
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file);
  }
}
