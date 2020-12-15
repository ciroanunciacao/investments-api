import { Field, InputType } from 'type-graphql';
import { User } from '../../../../domain/entities/User';

@InputType()
export default class UpdateUserProfileInput implements Partial<User> {
  @Field({ nullable: true })
  birthdate?: Date;
}
