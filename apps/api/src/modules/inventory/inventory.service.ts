import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  // ─── PRODUCTS ───────────────────────────────────────────────

  async createProduct(dto: Partial<Product>): Promise<Product> {
    const exists = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (exists) throw new ConflictException(`SKU "${dto.sku}" already exists`);
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAllProducts(page = 1, limit = 20, search?: string) {
    const qb = this.productRepo.createQueryBuilder('p');
    if (search) {
      qb.andWhere('(p.name ILIKE :s OR p.sku ILIKE :s)', { s: `%${search}%` });
    }
    qb.orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findProductById(id: string): Promise<Product> {
    const p = await this.productRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Product "${id}" not found`);
    return p;
  }

  async updateProduct(id: string, dto: Partial<Product>): Promise<Product> {
    await this.findProductById(id);
    await this.productRepo.update(id, dto);
    return this.findProductById(id);
  }

  async removeProduct(id: string): Promise<void> {
    await this.findProductById(id);
    await this.productRepo.softDelete(id);
  }

  // ─── WAREHOUSES ─────────────────────────────────────────────

  async createWarehouse(dto: Partial<Warehouse>): Promise<Warehouse> {
    const exists = await this.warehouseRepo.findOne({
      where: { code: dto.code },
    });
    if (exists)
      throw new ConflictException(
        `Warehouse code "${dto.code}" already exists`,
      );
    const wh = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(wh);
  }

  async findAllWarehouses() {
    return this.warehouseRepo.find({ order: { name: 'ASC' } });
  }

  async findWarehouseById(id: string): Promise<Warehouse> {
    const wh = await this.warehouseRepo.findOne({ where: { id } });
    if (!wh) throw new NotFoundException(`Warehouse "${id}" not found`);
    return wh;
  }

  async updateWarehouse(
    id: string,
    dto: Partial<Warehouse>,
  ): Promise<Warehouse> {
    await this.findWarehouseById(id);
    await this.warehouseRepo.update(id, dto);
    return this.findWarehouseById(id);
  }

  async removeWarehouse(id: string): Promise<void> {
    await this.findWarehouseById(id);
    await this.warehouseRepo.softDelete(id);
  }
}
