import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { DocumentExtractionRequestDto } from '@repo/shared-schemas';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(private readonly aiService: AiService) {}

  async extractDataFromDocument(
    dto: DocumentExtractionRequestDto,
  ): Promise<any> {
    this.logger.log(
      `Extracting data from ${dto.documentType} at ${dto.documentUrl}`,
    );

    // In a production environment, we would:
    // 1. Fetch the file buffer from the URL (S3/CloudFront)
    // 2. Convert PDF to images if necessary, or pass the image directly to OpenAI Vision API
    // 3. Request a strict JSON schema output

    // Using a stub for now depending on document type
    if (dto.documentType === 'resume') {
      return this.stubResumeParsing();
    } else if (dto.documentType === 'invoice') {
      return this.stubInvoiceOcr();
    } else {
      return { status: 'unknown_type' };
    }
  }

  async categorizeExpense(
    description: string,
    amount: number,
  ): Promise<string> {
    this.logger.log(`Categorizing expense: ${description} ($${amount})`);

    // In production, we'd pass the description to AiService to classify against our GL accounts
    const prompt = `Categorize the following expense into a single GL account category (e.g. TRAVEL, MEALS, SOFTWARE, OFFICE_SUPPLIES):\nDescription: ${description}\nAmount: ${amount}`;

    const category = await this.aiService.generateText({
      prompt,
      type: 'report_description',
    }); // reusing generateText

    // Fallback stub logic based on keywords
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('flight') || lowerDesc.includes('hotel'))
      return 'TRAVEL';
    if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner'))
      return 'MEALS';
    if (lowerDesc.includes('aws') || lowerDesc.includes('github'))
      return 'SOFTWARE';
    return 'MISC';
  }

  private stubResumeParsing() {
    return {
      candidate: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        skills: ['TypeScript', 'Node.js', 'React', 'AWS'],
        experienceYears: 5,
        education: 'B.Sc. Computer Science',
      },
      similarityScore: 0.88, // Score computed against an active job description
    };
  }

  private stubInvoiceOcr() {
    return {
      vendorName: 'Acme Corp',
      invoiceNumber: 'INV-2026-001',
      date: '2026-05-20',
      totalAmount: 1450.0,
      currency: 'USD',
      lineItems: [
        { description: 'Server Hardware', quantity: 1, unitPrice: 1200.0 },
        { description: 'Shipping', quantity: 1, unitPrice: 250.0 },
      ],
    };
  }
}
