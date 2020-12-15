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
  }).createHandler();
};

export const handler: APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>,
) => {
  const handlerCallback: Callback<APIGatewayProxyResult> = (
    error?: Error | string | null,
    result?: APIGatewayProxyResult,
  ) => {
    if (error) {
      Logger.e(consts.APP.TAG, 'Error on handler callback', error);
    }
    Logger.d(consts.APP.TAG, 'callback result', result);
    callback(error, result);
  };

  if (typeof handlerGraph === 'function') {
    Logger.i(consts.APP.TAG, 'Reusing connection');
    handlerGraph(event, context, handlerCallback);
  } else {
    Logger.i(consts.APP.TAG, 'Creating database connection');

    createHandler()
      .then(async (fn: any) => {
        handlerGraph = fn;
        await initialize();
        Logger.i(consts.APP.TAG, 'Database connected');
        handlerGraph(event, context, handlerCallback);
      }).catch((error) => {
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
        handlerCallback(null, result);
      });
  }
};
