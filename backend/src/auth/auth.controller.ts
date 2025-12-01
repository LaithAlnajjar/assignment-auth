import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { type Response, type Request } from 'express';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(
    @Body() body: { idToken: string; refreshToken: string },
    @Res() res: Response,
  ) {
    res.cookie('access_token', body.idToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600 * 1000,
    });

    res.cookie('refresh_token', body.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 14 * 24 * 3600 * 1000,
    });

    return res.send({ status: 'success' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refresh_token as string;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    try {
      const apiKey = process.env.FIREBASE_API_KEY;
      const response = await axios.post<{
        id_token: string;
        refresh_token: string;
      }>(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const newIdToken = response.data.id_token;
      const newRefreshToken = response.data.refresh_token;

      res.cookie('access_token', newIdToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600 * 1000,
      });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 14 * 24 * 3600 * 1000,
      });

      return res.send({ status: 'refreshed' });
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Refresh failed');
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({ status: 'logged out' });
  }
}
