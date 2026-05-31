import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AutoNumberSequence } from './entities/auto-number-sequence.entity';

@Injectable()
export class SequenceService {
  private readonly logger = new Logger(SequenceService.name);

  constructor(
    @InjectRepository(AutoNumberSequence)
    private readonly sequenceRepo: Repository<AutoNumberSequence>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generates the next number for a document type.
   * This uses a transaction and row-level locking to prevent duplicates.
   */
  async getNextNumber(
    tenantId: string,
    documentType: string,
    defaultPrefix: string = '',
  ): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      let sequence = await manager.findOne(AutoNumberSequence, {
        where: { tenantId, documentType, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sequence) {
        sequence = manager.create(AutoNumberSequence, {
          tenantId,
          documentType,
          prefix: defaultPrefix,
          nextValue: 1,
          padding: 4,
          isActive: true,
        });
      }

      const prefix = sequence.prefix || '';
      const suffix = sequence.suffix || '';
      const value = sequence.nextValue
        .toString()
        .padStart(sequence.padding, '0');
      const generatedNumber = `${prefix}${value}${suffix}`;

      // Increment for next time
      sequence.nextValue += 1;
      await manager.save(sequence);

      return generatedNumber;
    });
  }

  /**
   * Initializes or updates a sequence configuration.
   */
  async configureSequence(
    tenantId: string,
    documentType: string,
    config: Partial<AutoNumberSequence>,
  ) {
    let sequence = await this.sequenceRepo.findOne({
      where: { tenantId, documentType },
    });

    if (sequence) {
      Object.assign(sequence, config);
    } else {
      sequence = this.sequenceRepo.create({
        ...config,
        tenantId,
        documentType,
      });
    }

    return this.sequenceRepo.save(sequence);
  }
}
