import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './entities/user-preference.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly preferenceRepo: Repository<UserPreference>,
  ) {}

  async findOne(userId: string, key: string) {
    const pref = await this.preferenceRepo.findOne({ where: { userId, key } });
    return pref ? pref.value : null;
  }

  async findAll(userId: string) {
    const prefs = await this.preferenceRepo.find({ where: { userId } });
    return prefs.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  async set(userId: string, key: string, value: any) {
    let pref = await this.preferenceRepo.findOne({ where: { userId, key } });
    if (pref) {
      pref.value = value;
    } else {
      pref = this.preferenceRepo.create({ userId, key, value });
    }
    return this.preferenceRepo.save(pref);
  }
}
