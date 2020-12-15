import { ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { User, UserModel } from '../../entities/User';
import { UserRepository } from '../UserRepository';

export default class DBUserRepository implements UserRepository {
  protected model: ReturnModelType<AnyParamConstructor<any>, {}>;

  constructor() {
    this.model = UserModel;
  }

  get(id: string): Promise<User> {
    return this.model.findOne({ _id: id }).exec();
  }

  getByUid(uid: string): Promise<User> {
    return this.model.findOne({ uid }).exec();
  }

  create(entity: User): Promise<User> {
    return this.model.create(entity);
  }

  async update(id: string, entity: User): Promise<User> {
    await this.model.updateOne({ _id: id }, entity).exec();
    return this.model.findOne({ _id: id }).exec();
  }
}
