import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return UserDto.fromModel(user);
  }
}
