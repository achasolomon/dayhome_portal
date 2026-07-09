import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DayhomeService } from './dayhome.service';
import { IntakeDayhomeDto } from './dto/intake-dayhome.dto';
import { IntakeResponseDto } from './dto/intake-response.dto';
import { IntakeSignatureGuard } from './guards/intake-signature.guard';

@ApiTags('Dayhomes')
@Controller({ path: 'dayhomes', version: '1' })
export class DayhomeController {
  constructor(private readonly dayhomeService: DayhomeService) {}

  @Post('intake')
  @HttpCode(201)
  @UseGuards(IntakeSignatureGuard)
  @ApiSecurity('signature')
  @ApiOperation({
    summary: 'Receive an approved dayhome from the Application Portal',
  })
  @ApiResponse({
    status: 201,
    description: 'Dayhome created',
    type: IntakeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate idempotency key or externalId',
  })
  async intake(
    @Body() dto: IntakeDayhomeDto,
    @Req() req: Request,
  ): Promise<IntakeResponseDto> {
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    return this.dayhomeService.intake(
      dto,
      req.rawBody as Buffer,
      idempotencyKey,
    );
  }
}
