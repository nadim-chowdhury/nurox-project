import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../modules/hr/entities/department.entity';
import { Employee } from '../../modules/hr/entities/employee.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async seedAll() {
    this.logger.log('Starting execution of database seeders...');
    await this.seedDepartments();
    // Add seeders for Users, Finances, etc. here later
    this.logger.log('Seeding completed successfully!');
  }

  private async seedDepartments() {
    const defaultDepts = [
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Core HR and Employee management',
      },
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software Development and IT',
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Accounting and Financial Planning',
      },
      {
        name: 'Sales',
        code: 'SAL',
        description: 'Global Sales and Partnerships',
      },
    ];

    for (const data of defaultDepts) {
      const exists = await this.departmentRepo.findOneBy({ code: data.code });
      if (!exists) {
        const dept = this.departmentRepo.create(data);
        await this.departmentRepo.save(dept);
        this.logger.log(`Created Department: ${dept.name} (${dept.code})`);
      } else {
        this.logger.debug(`Department ${data.code} already exists, skipping.`);
      }
    }
  }
}
