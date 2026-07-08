import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/entities/user.model';
import type { Request, Response } from 'express';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly loginThrottle: LoginThrottleGuard,
  ) {}

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 201, description: 'Authentication tokens returned' })
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      await this.loginThrottle.recordFailure(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.loginThrottle.clearAttempts(ip);
    const tokens = await this.authService.login(user);

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'New access token returned' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return UserDto.fromModel(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Log out and invalidate refresh token' })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Authenticated user returned' })
  me(@CurrentUser() user: User): UserDto {
    return UserDto.fromModel(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 201, description: 'Password changed' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({ status: 201, description: 'Reset link sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a reset token' })
  @ApiResponse({ status: 201, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
