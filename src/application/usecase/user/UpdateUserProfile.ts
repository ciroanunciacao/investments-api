import { UseCase } from '../UseCase';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AppContext } from '../../../delivery/graphql/context';
import UpdateUserProfileInput from '../../../delivery/graphql/inputs/user/UpdateUserProfileInput';

interface UpdateUserProfileRequest {
  context?: AppContext
  id?: string
  input: UpdateUserProfileInput
}

export default class UpdateUserProfile implements UseCase<UpdateUserProfileRequest, User> {
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(request: UpdateUserProfileRequest): Promise<User> {
    if (request.id) {
      return this.repository.update(request.id, request.input);
    }

    const entity = await this.repository.getByUid(request.context.credentials.sub);
    if (entity) {
      return this.repository.update(entity.id, request.input);
    }

    throw new Error('unable to find user');
  }
}
