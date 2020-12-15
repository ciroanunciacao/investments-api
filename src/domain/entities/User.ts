import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { defaultSchemaOptions } from '../../infrastructure/database/mongo';
import { deepMerge } from '../../infrastructure/utils';
import BaseEntity from './BaseEntity';

@ObjectType()
@modelOptions({ schemaOptions: deepMerge({ collection: 'users' }, defaultSchemaOptions) })
export class User extends BaseEntity {
  @prop({ unique: true })
  @Field()
  uid: string;

  @prop()
  @Field({ nullable: true })
  name?: string;

  @prop()
  @Field({ nullable: true })
  email?: string;

  @prop()
  @Field({ nullable: true })
  profilePicture?: string;

  @prop()
  @Field({ nullable: true })
  birthdate?: Date;
}

export const UserModel = getModelForClass(User);
