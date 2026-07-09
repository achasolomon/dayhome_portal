import { Injectable } from '@nestjs/common';
import { DayhomeRepository } from './dayhome.repository';

@Injectable()
export class DayhomeService {
  constructor(private readonly repository: DayhomeRepository) {}
}
