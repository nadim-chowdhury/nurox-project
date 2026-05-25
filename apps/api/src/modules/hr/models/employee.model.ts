import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Employee')
export class EmployeeModel {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  designation?: string;
}
