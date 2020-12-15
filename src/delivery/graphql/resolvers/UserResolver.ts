import {
  Arg, Ctx, Mutation, Query, Resolver,
} from 'type-graphql';
import FetchUser from '../../../application/usecase/user/FetchUser';
import UpdateUserProfile from '../../../application/usecase/user/UpdateUserProfile';
import { User } from '../../../domain/entities/User';
import DBUserRepository from '../../../domain/repositories/database/DBUserRepository';
import UpdateUserProfileInput from '../inputs/user/UpdateUserProfileInput';

@Resolver()
export default class UserResolver {
  private fetchUser: FetchUser;

  private updateUserProfile: UpdateUserProfile;

  constructor() {
    const repository = new DBUserRepository();
    this.fetchUser = new FetchUser(repository);
    this.updateUserProfile = new UpdateUserProfile(repository);
  }

  @Query(() => User)
  async me(@Ctx() ctx: any): Promise<User> {
    return this.fetchUser.execute({ context: ctx });
  }

  @Mutation(() => User)
  async updateProfile(@Arg('data') input: UpdateUserProfileInput, @Ctx() ctx: any): Promise<User> {
    return this.updateUserProfile.execute({ input, context: ctx });
  }
}
