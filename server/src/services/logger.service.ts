import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import { getThreadIndex } from '../env';

const isProduction = process.env.NODE_ENV === 'production';

function prettyDevFormat() {
  return format.printf(({ level, message, timestamp, module: mod }) => {
    const TAGS: Record<string, string> = {
      info: chalk.cyan('INFO'),
      warn: chalk.yellow('WARN'),
      error: chalk.redBright('ERROR'),
      debug: chalk.greenBright('DEBUG')
    };

    const tag = TAGS[level] ?? level;
    const moduleTag = mod ? chalk.gray(`[${mod}]`) : '';
    const ts = chalk.gray(new Date(timestamp as string).toLocaleTimeString('en-GB'));

    return [`[${tag}]`, ts, moduleTag, message].filter(Boolean).join(' ');
  });
}

export const logger = createLogger({
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
