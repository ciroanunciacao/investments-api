import { UseCase } from '../UseCase';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AppContext } from '../../../delivery/graphql/context';
import AuthServiceFactory from '../../../infrastructure/auth/AuthServiceFactory';

interface FetchUserRequest {
  context?: AppContext
  id?: string
}

export default class FetchUser implements UseCase<FetchUserRequest, User> {
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(request: FetchUserRequest): Promise<User> {
    if (request.id) {
      return this.repository.get(request.id);
    }

    let entity = await this.repository.getByUid(request.context.credentials.sub);
    if (!entity) {
      const authUser = await AuthServiceFactory.create().getUserInfo(request.context.token);
      entity = await this.repository.create(authUser);
    }

    return entity;
  }
}
