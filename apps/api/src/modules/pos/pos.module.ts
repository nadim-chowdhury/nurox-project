import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosSession } from './entities/pos-session.entity';
import { PosOrder } from './entities/pos-order.entity';
import { PosService } from './services/pos.service';
import { PosController } from './controllers/pos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PosSession, PosOrder])],
  controllers: [PosController],
  providers: [PosService],
  exports: [PosService],
})
export class PosModule {}
