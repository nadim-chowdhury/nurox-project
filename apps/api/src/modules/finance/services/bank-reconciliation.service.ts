import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  BankTransaction,
  TransactionStatus,
} from '../entities/bank-transaction.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { JournalLine } from '../entities/journal.entity';
import { ClsService } from 'nestjs-cls';
import dayjs from 'dayjs';

export interface ReconciliationSuggestion {
  transaction: BankTransaction;
  potentialMatches: {
    journalLine: JournalLine;
    confidenceScore: number;
    matchReasons: string[];
  }[];
}

@Injectable()
export class BankReconciliationService {
  private readonly logger = new Logger(BankReconciliationService.name);

  constructor(
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(JournalLine)
    private readonly journalLineRepo: Repository<JournalLine>,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  /**
   * Calculates Dice Coefficient for string similarity (0.0 to 1.0)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = (str1 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = (str2 || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (s1 === s2 && s1.length > 0) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0.0;

    const bigrams1 = new Set<string>();
    for (let i = 0; i < s1.length - 1; i++)
      bigrams1.add(s1.substring(i, i + 2));

    const bigrams2 = new Set<string>();
    for (let i = 0; i < s2.length - 1; i++)
      bigrams2.add(s2.substring(i, i + 2));

    let intersection = 0;
    for (const bigram of bigrams1) {
      if (bigrams2.has(bigram)) intersection++;
    }

    return (2 * intersection) / (bigrams1.size + bigrams2.size);
  }

  async getSuggestions(
    bankAccountId: string,
  ): Promise<ReconciliationSuggestion[]> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: bankAccountId, tenantId: this.tenantId },
    });

    if (!account || !account.glAccountId) {
      throw new BadRequestException('Bank account not linked to GL account');
    }

    const unreconciledTransactions = await this.bankTransactionRepo.find({
      where: {
        bankAccountId,
        tenantId: this.tenantId,
        status: TransactionStatus.UNRECONCILED,
      },
      order: { date: 'DESC' },
    });

    const suggestions: ReconciliationSuggestion[] = [];

    for (const trx of unreconciledTransactions) {
      const amount = Math.abs(Number(trx.amount));
      const isDebit = Number(trx.amount) > 0;

      // Filter journal lines by: same GL account, same tenant, unreconciled, and within 15 days of transaction date
      const startDate = dayjs(trx.date)
        .subtract(15, 'day')
        .format('YYYY-MM-DD');
      const endDate = dayjs(trx.date).add(15, 'day').format('YYYY-MM-DD');

      const potentialLines = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoinAndSelect('line.journalEntry', 'entry')
        .where('line.accountId = :glAccountId', {
          glAccountId: account.glAccountId,
        })
        .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
        .andWhere('line.isReconciled = :isReconciled', { isReconciled: false })
        .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .andWhere(isDebit ? 'line.debit = :amount' : 'line.credit = :amount', {
          amount,
        })
        .getMany();

      const matches = potentialLines.map((line) => {
        let score = 40; // Base score for amount match
        const reasons: string[] = ['Exact amount match'];

        // 1. Date Match (Max 20)
        const dateDiff = Math.abs(
          dayjs(trx.date).diff(dayjs(line.journalEntry.entryDate), 'day'),
        );
        if (dateDiff === 0) {
          score += 20;
          reasons.push('Exact date match');
        } else if (dateDiff <= 1) {
          score += 15;
          reasons.push('Within 1 day');
        } else if (dateDiff <= 3) {
          score += 10;
          reasons.push('Within 3 days');
        } else {
          score += 5;
          reasons.push('Within date range');
        }

        // 2. Reference Match (Max 20)
        if (trx.reference && line.journalEntry.reference) {
          if (trx.reference === line.journalEntry.reference) {
            score += 20;
            reasons.push('Exact reference match');
          } else if (
            trx.reference.includes(line.journalEntry.reference) ||
            line.journalEntry.reference.includes(trx.reference)
          ) {
            score += 10;
            reasons.push('Partial reference match');
          }
        }

        // 3. Fuzzy Description Match (Max 20)
        const sim1 = this.calculateSimilarity(
          trx.description,
          line.description || '',
        );
        const sim2 = this.calculateSimilarity(
          trx.description,
          line.journalEntry.description || '',
        );
        const bestSim = Math.max(sim1, sim2);

        if (bestSim > 0.3) {
          const fuzzyScore = Math.round(bestSim * 20);
          score += fuzzyScore;
          reasons.push(`Description similarity: ${Math.round(bestSim * 100)}%`);
        }

        return {
          journalLine: line,
          confidenceScore: Math.min(score, 100),
          matchReasons: reasons,
        };
      });

      suggestions.push({
        transaction: trx,
        potentialMatches: matches.sort(
          (a, b) => b.confidenceScore - a.confidenceScore,
        ),
      });
    }

    return suggestions;
  }

  async reconcile(transactionId: string, journalLineId: string) {
    return this.dataSource.transaction(async (manager) => {
      const trx = await manager.findOne(BankTransaction, {
        where: { id: transactionId, tenantId: this.tenantId },
      });
      if (!trx) throw new NotFoundException('Bank transaction not found');
      if (trx.status === TransactionStatus.RECONCILED) {
        throw new BadRequestException('Transaction already reconciled');
      }

      const line = await manager.findOne(JournalLine, {
        where: { id: journalLineId, tenantId: this.tenantId },
      });
      if (!line) throw new NotFoundException('Journal line not found');
      if (line.isReconciled) {
        throw new BadRequestException('Journal line already reconciled');
      }

      // 1. Mark as reconciled
      trx.status = TransactionStatus.RECONCILED;
      trx.matchedJournalEntryId = line.journalEntryId;
      await manager.save(trx);

      line.isReconciled = true;
      await manager.save(line);

      return { success: true, transactionId, journalLineId };
    });
  }
}
