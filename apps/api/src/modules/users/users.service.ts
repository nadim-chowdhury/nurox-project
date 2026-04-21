import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * Find user by email with optional field inclusion.
   */
  async findByEmail(
    email: string,
    options: {
      includePassword?: boolean;
      includeResetFields?: boolean;
      includeTwoFactor?: boolean;
    } = {},
  ): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() });

    if (options.includePassword) {
      qb.addSelect('user.passwordHash');
    }
    if (options.includeResetFields) {
      qb.addSelect([
        'user.resetPasswordTokenHash',
        'user.resetPasswordExpires',
      ]);
    }
    if (options.includeTwoFactor) {
      qb.addSelect([
        'user.twoFactorSecret',
        'user.isTwoFactorEnabled',
        'user.twoFactorBackupCodes',
      ]);
    }

    return qb.getOne();
  }

  /**
   * Find user by ID. Optionally include refreshTokenHash for token rotation.
   */
  async findById(
    id: string,
    includeRefreshToken = false,
  ): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id });

    if (includeRefreshToken) {
      qb.addSelect('user.refreshTokenHash');
    }

    return qb.getOne();
  }

  /**
   * Find user by ID or throw 404.
   */
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * Create a new user (password should already be hashed).
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  /**
   * Update user fields.
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepo.update(id, data);
    return this.findByIdOrFail(id);
  }

  /**
   * Update refresh token hash (for token rotation).
   */
  async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.usersRepo.update(id, { refreshTokenHash: hash });
  }

  /**
   * Soft delete a user.
   */
  async remove(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.usersRepo.softDelete(id);
  }
}
