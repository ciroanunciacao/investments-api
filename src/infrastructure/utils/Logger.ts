import { createLogger, format, transports } from 'winston';
import { env } from '../config';

const DEFAULT_VERSION = 'local';

const logger = createLogger(
  {
    exitOnError: false,
    defaultMeta: {
      version: process.env.AWS_LAMBDA_FUNCTION_VERSION || DEFAULT_VERSION,
    },
    transports: [
      new transports.Console({
        level: env.logLevel,
        handleExceptions: true,
        format: format.combine(
          format.timestamp(),
          format.printf(({
            level, message, timestamp, ...meta
          }) => `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`),
        ),
      }),
    ],
  },
);

export default class Logger {
  static e(tag: string, message: string, meta?: any) {
    Logger.log('error', tag, message, meta);
  }

  static error(tag: string, message: string, meta?: any) {
    Logger.log('error', tag, message, meta);
  }

  static w(tag: string, message: string, meta?: any) {
    Logger.log('warn', tag, message, meta);
  }

  static warn(tag: string, message: string, meta?: any) {
    Logger.log('warn', tag, message, meta);
  }

  static i(tag: string, message: string, meta?: any) {
    Logger.log('info', tag, message, meta);
  }

  static info(tag: string, message: string, meta?: any) {
    Logger.log('info', tag, message, meta);
  }

  static d(tag: string, message: string, meta?: any) {
    Logger.log('debug', tag, message, meta);
  }

  static debug(tag: string, message: string, meta?: any) {
    Logger.log('debug', tag, message, meta);
  }

  static log(level: string, tag: string, message: string, meta?: any) {
    const method = typeof logger[level] === 'function' ? logger[level] : logger.info;
    method(`[${tag}] ${message}`, meta);
  }
}
