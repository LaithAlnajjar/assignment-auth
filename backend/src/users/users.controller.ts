import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/roles/admin.guard';
import { type Request } from 'express';

@Controller('')
export class UsersController {
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
