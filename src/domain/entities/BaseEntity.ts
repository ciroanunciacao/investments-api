import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export default abstract class BaseEntity extends TimeStamps {
  @Field(() => ID)
  readonly id?: string;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;
}
