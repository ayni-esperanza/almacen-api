import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthUser, JwtPayload } from '../common/interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return {
        id: user.id,
        username: user.username,
        isAuthenticated: true,
      };
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { 
      username: user.username, 
      sub: user.id 
    };

    // Update user authentication status
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isAuthenticated: true },
    });

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      isAuthenticated: true,
    };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isAuthenticated: false },
    });

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isAuthenticated: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
