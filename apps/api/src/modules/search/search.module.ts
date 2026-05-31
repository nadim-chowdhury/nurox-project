import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchListener } from './search.listener';
import { SearchQuery } from './entities/search-query.entity';
import { AiModule } from '../ai/ai.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SearchQuery]), AiModule],
  providers: [SearchService, SearchListener],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
