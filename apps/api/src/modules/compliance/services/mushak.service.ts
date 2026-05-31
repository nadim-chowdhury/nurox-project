import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mushak63 } from '../entities/mushak-63.entity';
import { VdsCertificate } from '../entities/vds-certificate.entity';
import { Mushak63Dto, VdsCertificateDto } from '@repo/shared-schemas';
import { SequenceService } from '../../system/sequence.service';

@Injectable()
export class MushakService {
  private readonly logger = new Logger(MushakService.name);

  constructor(
    @InjectRepository(Mushak63)
    private readonly mushak63Repo: Repository<Mushak63>,
    @InjectRepository(VdsCertificate)
    private readonly vdsRepo: Repository<VdsCertificate>,
    private readonly sequenceService: SequenceService,
  ) {}

  async createMushak63(tenantId: string, dto: Mushak63Dto): Promise<Mushak63> {
    this.logger.log(
      `Creating Mushak 6.3 for tenant ${tenantId}, invoice ${dto.invoiceNumber}`,
    );

    const invoiceNumber =
      dto.invoiceNumber ||
      (await this.sequenceService.getNextNumber(
        tenantId,
        'MUSHAK_6.3',
        'VAT-',
      ));

    const mushak = this.mushak63Repo.create({
      ...dto,
      tenantId,
      invoiceNumber,
      issueDate: new Date(dto.issueDate),
      items: dto.items.map((item) => ({
        ...item,
        tenantId,
      })),
    });

    return this.mushak63Repo.save(mushak);
  }

  async createVdsCertificate(
    tenantId: string,
    dto: VdsCertificateDto,
  ): Promise<VdsCertificate> {
    this.logger.log(
      `Creating VDS Certificate for tenant ${tenantId}, cert ${dto.certificateNumber}`,
    );

    const certificateNumber =
      dto.certificateNumber ||
      (await this.sequenceService.getNextNumber(tenantId, 'VDS_CERT', 'VDS-'));

    const certificate = this.vdsRepo.create({
      ...dto,
      tenantId,
      certificateNumber,
      issueDate: new Date(dto.issueDate),
      referenceMushak63Date: new Date(dto.referenceMushak63Date),
      treasuryChallanDate: dto.treasuryChallanDate
        ? new Date(dto.treasuryChallanDate)
        : undefined,
    });

    return this.vdsRepo.save(certificate);
  }

  async getMushak63(tenantId: string, id: string): Promise<Mushak63> {
    const mushak = await this.mushak63Repo.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });

    if (!mushak) {
      throw new NotFoundException(`Mushak 6.3 with ID ${id} not found`);
    }

    return mushak;
  }

  async listMushak63(tenantId: string): Promise<Mushak63[]> {
    return this.mushak63Repo.find({
      where: { tenantId },
      order: { issueDate: 'DESC' },
    });
  }

  async listVdsCertificates(tenantId: string): Promise<VdsCertificate[]> {
    return this.vdsRepo.find({
      where: { tenantId },
      order: { issueDate: 'DESC' },
    });
  }
}
