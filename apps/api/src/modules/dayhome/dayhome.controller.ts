import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DayhomeService } from './dayhome.service';
import { IntakeDayhomeDto } from './dto/intake-dayhome.dto';
import { IntakeResponseDto } from './dto/intake-response.dto';
import { DayhomeQueryDto } from './dto/dayhome-query.dto';
import { DayhomeListItemDto } from './dto/dayhome-list-item.dto';
import { DayhomeDetailDto } from './dto/dayhome-detail.dto';
import { IntakeSignatureGuard } from './guards/intake-signature.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';
import { PaginatedResponse } from '@spiced-dayhome/shared-types';

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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER')
  @Permissions('dayhomes.list')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List dayhomes with filters, search, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated dayhome list',
  })
  async findAll(
    @Query() query: DayhomeQueryDto,
  ): Promise<PaginatedResponse<DayhomeListItemDto>> {
    return this.dayhomeService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER')
  @Permissions('dayhomes.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dayhome by ID' })
  @ApiResponse({
    status: 200,
    description: 'Dayhome detail',
    type: DayhomeDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dayhome not found',
  })
  async findById(@Param('id') id: string): Promise<DayhomeDetailDto> {
    return this.dayhomeService.findById(id);
  }
}
