import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { DayhomeService } from './dayhome.service';
import { CallbackStatusDto } from './dto/callback-status.dto';
import { CallbackComplianceDto } from './dto/callback-compliance.dto';
import { CallbackEducatorProfileDto } from './dto/callback-educator-profile.dto';
import { CallbackDocumentsDto } from './dto/callback-documents.dto';
import { CallbackSignatureGuard } from './guards/callback-signature.guard';

@ApiTags('Internal Callbacks')
@Controller({ path: 'internal', version: '1' })
@UseGuards(CallbackSignatureGuard)
@ApiSecurity('signature')
export class InternalCallbackController {
  constructor(private readonly dayhomeService: DayhomeService) {}

  @Post('status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive status change from Application Portal' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Body() dto: CallbackStatusDto,
  ): Promise<{ message: string }> {
    await this.dayhomeService.updateStatusFromPortal(dto);
    return { message: 'Status updated successfully.' };
  }

  @Post('compliance')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Receive compliance inspection result from Application Portal',
  })
  @ApiResponse({ status: 200, description: 'Compliance record updated' })
  async updateCompliance(
    @Body() dto: CallbackComplianceDto,
  ): Promise<{ message: string }> {
    await this.dayhomeService.updateComplianceFromPortal(dto);
    return { message: 'Compliance record updated successfully.' };
  }

  @Put('educator-profile')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Receive educator profile update from Application Portal',
  })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateEducatorProfile(
    @Body() dto: CallbackEducatorProfileDto,
  ): Promise<{ message: string }> {
    await this.dayhomeService.updateEducatorProfileFromPortal(dto);
    return { message: 'Educator profile updated successfully.' };
  }

  @Post('documents')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive document updates from Application Portal' })
  @ApiResponse({ status: 200, description: 'Documents processed' })
  async updateDocuments(
    @Body() dto: CallbackDocumentsDto,
  ): Promise<{ message: string }> {
    await this.dayhomeService.updateDocumentsFromPortal(dto);
    return { message: 'Documents processed successfully.' };
  }
}
