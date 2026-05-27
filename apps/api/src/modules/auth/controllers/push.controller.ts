import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PushService } from '../services/push.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('auth/push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async subscribe(@CurrentUser() user: any, @Body() subscription: any) {
    return this.pushService.subscribe(user.id, subscription);
  }

  // Debug endpoint to trigger a push notification
  @Post('test')
  async testPush(@CurrentUser() user: any) {
    await this.pushService.sendPushNotification(user.id, {
      title: 'Nurox ERP',
      body: 'Push notifications are working!',
      icon: '/icon-192x192.png',
    });
    return { success: true };
  }
}
