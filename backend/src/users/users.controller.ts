import { Controller, UseGuards, Get, Req, Post } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/roles/admin.guard';
import { type Request } from 'express';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('users')
  createUser(@Req() req: Request) {
    const user = req.user;
    return this.usersService.createUserProfile(user!.uid, user!.email);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      user: req.user,
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('admin/stats')
  getAdminStats() {
    return {
      totalUsers: 105,
      revenue: '$50,000',
      activeUsers: 12,
    };
  }
}
