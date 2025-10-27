import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthUser, JwtPayload } from '../common/interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (
      user &&
      user.isActive &&
      (await bcrypt.compare(password, user.password))
    ) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
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
      sub: user.id,
      role: user.role,
    };

    // Update user authentication status
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isAuthenticated: true },
    });

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
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

  async getProfile(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isAuthenticated: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // User management methods
  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists (if provided)
    if (createUserDto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isAuthenticated: true,
      },
    });

    return user;
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isAuthenticated: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async getUserById(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isAuthenticated: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if username is being updated and doesn't conflict
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check if email is being updated and doesn't conflict
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if being updated
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isAuthenticated: true,
      },
    });

    return user;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Soft delete: set isActive to false instead of physically deleting
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }
}
