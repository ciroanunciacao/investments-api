import JwksRsa, { CertSigningKey, JwksClient, RsaSigningKey } from 'jwks-rsa';
import jwt, { JwtHeader, SigningKeyCallback, VerifyOptions } from 'jsonwebtoken';
import { promisified as phin } from 'phin';
import { AuthService, AuthUser } from '../AuthService';
import Logger from '../../utils/Logger';

export interface Auth0UserInfo {
  sub: string,
  name: string,
  picture?: string,
  email: string,
}

export default class Auth0Service implements AuthService {
  private client: JwksClient;

  private audience: string;

  private domain: string;

  constructor({ domain, audience }: { domain: string; audience: string }) {
    this.client = JwksRsa({
      cache: true,
      jwksUri: `https://${domain}/.well-known/jwks.json`,
    });

    this.domain = domain;
    this.audience = audience;
  }

  async getUserInfo(token: string): Promise<AuthUser> {
    const response = await phin({
      url: `https://${this.domain}/userinfo`,
      parse: 'json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.statusCode === 200 && response.body) {
      const userInfo: Auth0UserInfo = (response.body as Auth0UserInfo);

      return {
        uid: userInfo.sub,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        email: userInfo.email,
      };
    }

    Logger.i(this.constructor.name, 'Unable to fetch user info', { code: response.statusCode, body: response.body });
    throw new Error('Unable to fetch user info');
  }

  validateToken(token: string): Promise<object> {
    const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
      this.client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        const signingKey = (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey;
        return callback(null, signingKey);
      });
    };

    const options: VerifyOptions = {
      audience: this.audience,
      issuer: `https://${this.domain}/`,
      algorithms: ['RS256'],
    };

    return new Promise((resolve) => {
      jwt.verify(token, getKey, options, (err, decoded) => {
        if (err) {
          Logger.e(this.constructor.name, 'fail to verify token', err);
          return resolve(null);
        }
        return resolve(decoded);
      });
    });
  }
}
