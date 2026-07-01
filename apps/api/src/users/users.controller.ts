// src/users/users.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({
    summary: 'Create a user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  create(
    @Body()
    dto: CreateUserDto,
  ) {
    return dto;
  }
}
