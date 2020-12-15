import * as http from 'http';
import * as url from 'url';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context,
} from 'aws-lambda';

import { handler } from './api';
import Logger from './infrastructure/utils/Logger';

const TAG = 'server';

const handleServer: http.RequestListener = (
  req: http.IncomingMessage, res: http.ServerResponse,
): void => {
  const { headers, method } = req;

  const multiValueHeaders: { [name: string]: string[] } = { 'x-empty': [''] };

  const event: APIGatewayProxyEvent = {
    httpMethod: method,
    body: '',
    headers: headers as { [name: string]: string },
    multiValueHeaders,
    isBase64Encoded: false,
    queryStringParameters: url.parse(req.url, true).query as { [name: string]: string },
    multiValueQueryStringParameters: null,
    pathParameters: null,
    path: req.url,
    stageVariables: {},
    resource: '',
    requestContext: {
      authorizer: null,
      protocol: 'https',
      accountId: new Date().getTime().toString(16),
      apiId: new Date().getTime().toString(16),
      stage: new Date().getTime().toString(16),
      httpMethod: method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: req.url,
      requestId: new Date().getTime().toString(16),
      resourceId: new Date().getTime().toString(16),
      resourcePath: req.url,
      requestTimeEpoch: new Date().getTime(),
      requestTime: new Date().toJSON(),
    },
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, Cache-Control, postman-token',
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const buffer: any[] = [];

  const promisor = {
    handleRequestData: (chunk: any) => {
      buffer.push(chunk);
    },
    handleRequestFinish: async () => {
      const body = Buffer.concat(buffer).toString();
      event.body = body;

      const context: Context = {
        functionVersion: '',
        awsRequestId: new Date().getTime().toString(16),
        functionName: '',
        invokedFunctionArn: '',
        callbackWaitsForEmptyEventLoop: true,
        memoryLimitInMB: '256',
        logGroupName: '',
        logStreamName: '',
        getRemainingTimeInMillis: () => 200,
        done: (error?: Error, result?: any) => {
          Logger.d(TAG, 'Called done', { error, result });
        },
        fail: (error: Error | string) => {
          Logger.d(TAG, 'Called fail', { error });
        },
        succeed: (messageOrObject: any) => {
          Logger.d(TAG, 'Called succeed', { messageOrObject });
        },
      };

      (handler(event, context, null) as Promise<APIGatewayProxyResult>)
        .then((result: APIGatewayProxyResult) => {
          const responseHeaders = result.headers || {};
          Object.keys(responseHeaders).forEach((header) => {
            res.setHeader(header, responseHeaders[header].toString());
          });
          res.writeHead(result.statusCode);
          res.write(result.body);
          res.end();
        })
        .catch((error: any) => {
          res.writeHead(500);
          res.write(JSON.stringify(error));
          res.end();
        });
    },
  };

  req
    .on('data', promisor.handleRequestData)
    .on('end', promisor.handleRequestFinish);
};

const listenServer = () => {
  Logger.i(TAG, 'Server running at http://localhost:3000');
};

http.createServer(handleServer).listen(3000, listenServer);
