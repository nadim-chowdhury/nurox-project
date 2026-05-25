import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmployeeModel } from '../models/employee.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
// Note: GraphQL has its own AuthGuards setup (GqlAuthGuard), but for POC we can leave it open or use a simple adapter.

@Resolver(() => EmployeeModel)
export class EmployeeResolver {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  @Query(() => [EmployeeModel])
  async employees(): Promise<EmployeeModel[]> {
    const employees = await this.employeeRepo.find({
      take: 50,
      relations: ['department', 'designation'],
    });

    return employees.map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department?.name,
      designation: emp.designation?.title,
    }));
  }

  @Query(() => EmployeeModel, { nullable: true })
  async employee(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EmployeeModel | null> {
    const emp = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department', 'designation'],
    });

    if (!emp) return null;

    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department?.name,
      designation: emp.designation?.title,
    };
  }
}
