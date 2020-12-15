import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import AuthServiceFactory from '../../../infrastructure/auth/AuthServiceFactory';

export interface AppContext {
  lambdaFunction: string
  credentials: any
  token: string
}

export async function createContext(ctx: Context, e: APIGatewayProxyEvent): Promise<AppContext> {
  const lambdaFunction = `${ctx.functionName}:${ctx.functionVersion}`;
  const authorization = e.headers.Authorization || e.headers.authorization;

  let credentials: object = null;
  let token: string = null;

  if (authorization) {
    [, token] = authorization.split(/\s/g);
    credentials = await AuthServiceFactory.create().validateToken(token);
  }

  return { lambdaFunction, credentials, token };
}
