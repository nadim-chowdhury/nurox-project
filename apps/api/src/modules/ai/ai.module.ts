import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { DocumentProcessorService } from './services/document-processor.service';
import { AiAssistantController } from './controllers/ai-assistant.controller';
import { AiToolsController } from './controllers/ai-tools.controller';
import { PredictiveAnalyticsController } from './controllers/predictive.controller';

@Module({
  controllers: [
    AiAssistantController,
    AiToolsController,
    PredictiveAnalyticsController,
  ],
  providers: [AiService, DocumentProcessorService],
  exports: [AiService, DocumentProcessorService],
})
export class AiModule {}
