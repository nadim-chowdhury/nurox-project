import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('channels')
  @ApiOperation({ summary: 'Get user chat channels' })
  async getMyChannels(@Req() req: any) {
    return this.chatService.getUserChannels(req.tenantId, req.user.sub);
  }

  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Get messages for a channel' })
  async getChannelMessages(
    @Req() req: any,
    @Param('channelId') channelId: string,
  ) {
    return this.chatService.getChannelMessages(req.tenantId, channelId);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Create a new channel' })
  async createChannel(@Req() req: any, @Body() body: any) {
    return this.chatService.createChannel(req.tenantId, body);
  }
}
