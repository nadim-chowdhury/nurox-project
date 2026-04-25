import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './utils/encryption.util';

@Global()
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class CommonModule {}
