import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log('Verifying password:', {
      plainPassword,
      hashedPassword,
      plainLength: plainPassword.length,
      hashLength: hashedPassword.length
    });
    
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password verification result:', { result });
    return result;
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('Validating user:', { email });
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('User not found');
      return null;
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return null;
    }

    console.log('Password valid, returning user');
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(userData: any) {
    const hashedPassword = await this.hashPassword(userData.password);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user: result,
      token: this.jwtService.sign(payload),
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link.' };
    }

    const payload = { email: user.email, sub: user.id, type: 'password_reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    // In a real application, you would send this token via email
    return {
      message: 'If your email is registered, you will receive a password reset link.',
      token, // Remove this in production
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await this.hashPassword(newPassword);
      await this.usersService.update(user.id, { password: hashedPassword });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async setTestPassword(email: string, password: string) {
    console.log('Setting test password:', { email });
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log('User not found');
      throw new NotFoundException('User not found');
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      currentPasswordHash: user.password
    });

    const hashedPassword = await this.hashPassword(password);
    console.log('Generated hash:', {
      password,
      hashedPassword,
      passwordLength: password.length,
      hashLength: hashedPassword.length
    });

    await this.usersService.update(user.id, { password: hashedPassword });
    console.log('Password updated successfully');

    return { message: 'Test password has been set successfully' };
  }
} 