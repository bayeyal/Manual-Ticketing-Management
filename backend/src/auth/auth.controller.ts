import { Controller, Post, Body, UnauthorizedException, BadRequestException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: any) {
    return user;
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    console.log('Login request received:', {
      email: loginDto.email,
      passwordLength: loginDto.password.length,
      password: loginDto.password, // Remove this in production
      passwordChars: loginDto.password.split('').map(c => c.charCodeAt(0))
    });

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.sendPasswordResetEmail(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  // Temporary endpoint for testing
  @Post('set-test-password')
  async setTestPassword(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.setTestPassword(body.email, body.password);
  }
} 