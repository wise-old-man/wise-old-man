import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import { getThreadIndex } from '../env';

const isProduction = process.env.NODE_ENV === 'production';

const rootLogger = createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: process.env.NODE_ENV === 'test',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    isProduction ? format.json() : prettyDevFormat()
  ),
  defaultMeta: {
    app: process.env.SERVER_TYPE ?? 'dev',
    threadIndex: getThreadIndex(),
    env: process.env.NODE_ENV ?? 'development'
  },
  transports: [
    new transports.Console(),
    ...(isProduction
      ? []
      : [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' })
        ])
  ]
});

class Logger {
  info(message: string, data?: unknown) {
    rootLogger.info(message, { data });
  }

  warn(message: string, data?: unknown) {
    rootLogger.warn(message, { data });
  }

  error(message: string, data?: unknown) {
    rootLogger.error(message, { data });
  }

  debug(message: string, data?: unknown) {
    rootLogger.debug(message, { data });
  }
}

function prettyDevFormat() {
  return format.printf(({ level, message, timestamp, module: mod, ...meta }) => {
    const TAGS = {
      info: chalk.cyan('INFO'),
      warn: chalk.yellow('WARN'),
      error: chalk.redBright('ERROR'),
      debug: chalk.greenBright('DEBUG')
    };

    const tag = TAGS[level] ?? level;

    const moduleTag = mod ? chalk.gray(`[${mod}]`) : '';
    const ts = chalk.gray(new Date(timestamp as string).toLocaleTimeString('en-GB'));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { app: _a, threadIndex: _t, env: _e, ...rest } = meta;
    const extra = Object.keys(rest).length > 0 ? chalk.gray(JSON.stringify(rest)) : '';

    return [`[${tag}]`, ts, moduleTag, message, extra].filter(Boolean).join(' ');
  });
}

const logger = new Logger();
export { logger };
