import 'reflect-metadata';
import {
  APIGatewayProxyHandler, APIGatewayProxyEvent, Context, APIGatewayProxyResult, Callback,
} from 'aws-lambda';

import { ApolloServer } from 'apollo-server-lambda';
import { buildSchema } from 'type-graphql';
import resolvers from './delivery/graphql/resolvers';
import Logger from './infrastructure/utils/Logger';
import { consts } from './infrastructure/config';
import initialize from './infrastructure';
import { createContext, AppContext } from './delivery/graphql/context';

let handlerGraph: any | undefined;

export const createHandler = async (): Promise<any> => {
  const schema = await buildSchema({ resolvers, dateScalarMode: 'isoDate' });
  return new ApolloServer({
    schema,
    introspection: true,
    context: async ({ context, event }) => {
      const data: AppContext = await createContext(context, event);
      return data;
    },
    playground: {
      endpoint: '/dev/graphql',
    },
  }).createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  });
};

const callHandlerGraph = async (event: APIGatewayProxyEvent, context: Context):
Promise<APIGatewayProxyResult> => new Promise<APIGatewayProxyResult>(
  (resolve, reject) => {
    const handlerCallback: Callback<APIGatewayProxyResult> = (
      error?: Error | string | null,
      result?: APIGatewayProxyResult,
    ) => {
      if (error) {
        Logger.e(consts.APP.TAG, 'Error on handler callback', error);
        return reject(error);
      }
      const response: APIGatewayProxyResult = { ...result, isBase64Encoded: false };
      Logger.d(consts.APP.TAG, 'callback response', response);
      return resolve(response);
    };

    handlerGraph(event, context, handlerCallback);
  },
);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent, context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    if (typeof handlerGraph === 'function') {
      Logger.i(consts.APP.TAG, 'Reusing connection');
      return callHandlerGraph(event, context);
    }
    Logger.i(consts.APP.TAG, 'Creating database connection');
    await initialize();
    handlerGraph = await createHandler();

    return callHandlerGraph(event, context);
  } catch (error) {
    Logger.e(consts.APP.TAG, 'Error creating database connection', error);
    handlerGraph = undefined;

    const result: APIGatewayProxyResult = {
      statusCode: 500,
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      isBase64Encoded: false,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return result;
  }
};
