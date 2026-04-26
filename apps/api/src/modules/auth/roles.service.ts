import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, Permission } from '@repo/shared-schemas';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  /**
   * Resolves all permissions for a role, including those inherited from parents.
   */
  async getEffectivePermissions(role: Role | string): Promise<Permission[]> {
    const roleEntity =
      typeof role === 'string'
        ? await this.roleRepo.findOne({ where: { id: role } })
        : role;

    if (!roleEntity) return [];

    const permissions = new Set<Permission>(roleEntity.permissions);

    if (roleEntity.parentRoleId) {
      const parentPermissions = await this.getEffectivePermissions(
        roleEntity.parentRoleId,
      );
      parentPermissions.forEach((p) => permissions.add(p));
    }

    return Array.from(permissions);
  }

  async findAll() {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: CreateRoleDto) {
    const existing = await this.roleRepo.findOne({
      where: { name: data.name },
    });
    if (existing)
      throw new ConflictException('Role with this name already exists');

    const role = this.roleRepo.create({
      ...data,
      isSystem: false,
    });
    return this.roleRepo.save(role);
  }

  async update(id: string, data: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      // Allow updating description or permissions but maybe not name?
      // Usually system roles should have protected permissions too.
    }

    Object.assign(role, data);
    return this.roleRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem)
      throw new ConflictException('System roles cannot be deleted');
    await this.roleRepo.remove(role);
  }

  async findByName(name: string) {
    return this.roleRepo.findOne({ where: { name } });
  }
}
