import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // El guard se encarga de redirigir a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const { email, name } = req.user;
    const result = await this.authService.validateGoogleUser(email, name);

    // Redirige solo con el token, no con el objeto user
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${result.access_token}`
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    // Devuelve los datos del usuario autenticado
    return req.user;
  }
}