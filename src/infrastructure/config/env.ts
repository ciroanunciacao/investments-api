const env: {
  logLevel?: string
  database?: {
    uri: string
  },
  auth0?: {
    domain: string
    audience: string
    client: string
    secret: string
  }
} = {};

env.logLevel = process.env.LOG_LEVEL || 'debug';

env.database = {
  uri: process.env.MONGODB_URI,
};

env.auth0 = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  client: process.env.AUTH0_CLIENT_ID,
  secret: process.env.AUTH0_CLIENT_SECRET,
};

export default env;
