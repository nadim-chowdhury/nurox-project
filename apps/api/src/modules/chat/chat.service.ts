import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatChannel } from './entities/chat-channel.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SearchService } from '../search/search.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatChannel)
    private readonly channelRepo: Repository<ChatChannel>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    private readonly searchService: SearchService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
    const saved = await this.messageRepo.save(message);

    this.eventEmitter.emit('chat.message_sent', saved);

    return saved;
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
