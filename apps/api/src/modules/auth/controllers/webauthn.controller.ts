import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { WebauthnService } from '../services/webauthn.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('auth/webauthn')
export class WebauthnController {
  constructor(private readonly webauthnService: WebauthnService) {}

  @Get('register')
  async getRegistrationOptions(@CurrentUser() user: any) {
    return this.webauthnService.generateRegistrationOptions(user);
  }

  @Post('register')
  async verifyRegistration(@CurrentUser() user: any, @Body() body: any) {
    return this.webauthnService.verifyRegistration(user, body);
  }

  @Get('authenticate')
  async getAuthenticationOptions(@CurrentUser() user: any) {
    return this.webauthnService.generateAuthenticationOptions(user);
  }

  @Post('authenticate')
  async verifyAuthentication(@CurrentUser() user: any, @Body() body: any) {
    return this.webauthnService.verifyAuthentication(user, body);
  }
}
