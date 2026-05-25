import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from '../../modules/system/api-key.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract x-api-key header
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const keyEntity = await this.apiKeyService.validateKey(apiKey);

    if (!keyEntity) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Attach the validated key and its associated tenantId to the request for subsequent guards/controllers
    (request as any).apiKey = keyEntity;
    (request as any).tenantId = keyEntity.tenantId;

    return true;
  }
}
