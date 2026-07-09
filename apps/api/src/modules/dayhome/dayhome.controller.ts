import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DayhomeService } from './dayhome.service';

@ApiTags('Dayhomes')
@Controller({ path: 'dayhomes', version: '1' })
export class DayhomeController {
  constructor(private readonly dayhomeService: DayhomeService) {}
}
