import { env } from '../config';
import Auth0Service from './auth0/Auth0Service';
import { AuthService } from './AuthService';

export default abstract class AuthServiceFactory {
  static create(): AuthService {
    return new Auth0Service({
      domain: env.auth0.domain,
      audience: env.auth0.audience,
    });
  }
}
