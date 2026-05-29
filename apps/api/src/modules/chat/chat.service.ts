import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatChannel } from './entities/chat-channel.entity';
import { ChatMessage } from './entities/chat-message.entity';
// @ts-ignore - moduleResolution: node can't resolve meilisearch exports
import { Meilisearch } from 'meilisearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private meiliSearchClient: Meilisearch;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatChannel)
    private readonly channelRepo: Repository<ChatChannel>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    private readonly configService: ConfigService,
  ) {
    try {
      this.meiliSearchClient = new Meilisearch({
        host:
          this.configService.get<string>('MEILISEARCH_HOST') ||
          'http://localhost:7700',
        apiKey:
          this.configService.get<string>('MEILISEARCH_API_KEY') || 'masterKey',
      });
    } catch (e) {
      this.logger.warn('Meilisearch not configured');
    }
  }

  async saveMessage(
    tenantId: string,
    dto: {
      channelId: string;
      senderId: string;
      content: string;
      mentions: string[];
    },
  ) {
    const message = this.messageRepo.create({
      tenantId,
      channelId: dto.channelId,
      senderId: dto.senderId,
      content: dto.content,
      mentions: dto.mentions,
    });
    await this.messageRepo.save(message);

    if (this.meiliSearchClient) {
      try {
        await this.meiliSearchClient.index('chat_messages').addDocuments([
          {
            id: message.id,
            tenantId,
            channelId: message.channelId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt,
          },
        ]);
      } catch (e) {
        this.logger.error('Failed to index chat message', e);
      }
    }

    return message;
  }

  async getChannelMessages(tenantId: string, channelId: string, limit = 50) {
    return this.messageRepo.find({
      where: { tenantId, channelId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });
  }

  async getUserChannels(tenantId: string, userId: string) {
    // Basic implementation: fetch channels where participants includes userId
    // TypeORM JSONB querying can be complex, for simplicity we might fetch all and filter or use QueryBuilder
    return this.channelRepo
      .createQueryBuilder('channel')
      .where('channel.tenantId = :tenantId', { tenantId })
      .andWhere(`channel.participants ::jsonb @> '"${userId}"'`)
      .getMany();
  }

  async createChannel(tenantId: string, data: Partial<ChatChannel>) {
    const channel = this.channelRepo.create({ ...data, tenantId });
    return this.channelRepo.save(channel);
  }
}
