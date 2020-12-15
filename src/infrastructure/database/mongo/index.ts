/* eslint-disable no-underscore-dangle */
import mongoose, { SchemaOptions } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { consts, env } from '../../config';
import Logger from '../../utils/Logger';

export const defaultSchemaOptions: SchemaOptions = {
  toJSON: {
    transform: (_doc: DocumentType<any>, ret) => {
      const r = ret;
      r.id = r._id;
      delete r._id;
    },
    versionKey: false,
  },
};

export default async function getConnection(): Promise<void> {
  mongoose.connection
    .on('error', (error) => {
      Logger.e(consts.APP.TAG, 'database connectior error', error);
    })
    .on('disconnected', () => {
      Logger.i(consts.APP.TAG, 'database disconnected');
    })
    .once('open', () => {
      Logger.i(consts.APP.TAG, 'database connected');
    });

  await mongoose.connect(
    env.database.uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      useCreateIndex: true,
    },
  );
}
