import chalk from 'chalk';
import { isTesting } from '../../env';
import { Logger as WinstonLogger, createLogger, transports, format } from 'winston';

class Logger {
  private errorLogger: WinstonLogger;
  private debugLogger: WinstonLogger;
  private infoLogger: WinstonLogger;
  private moderationLogger: WinstonLogger;

  constructor() {
    this.errorLogger = createLogger({
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: 'logs/error.log', level: 'error' })]
    });

    this.debugLogger = createLogger({
      level: 'debug',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: 'logs/debug.log', level: 'debug' })]
    });

    this.infoLogger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: 'logs/info.log', level: 'info' })]
    });

    this.moderationLogger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: 'logs/moderation.log', level: 'info' })]
    });
  }

  error(message: string, data?: unknown, printData?: boolean) {
    if (isTesting()) return;

    this.errorLogger.error(message, data);
    prettyPrint('error', message, printData && data);
  }

  debug(message: string, data?: unknown, printData?: boolean) {
    if (isTesting()) return;

    this.debugLogger.debug(message, data);
    prettyPrint('debug', message, printData && data);
  }

  info(message: string, data?: unknown, printData?: boolean) {
    if (isTesting()) return;

    this.infoLogger.info(message, data);
    prettyPrint('info', message, printData && data);
  }

  moderation(message: string, data?: unknown, printData?: boolean) {
    // if (isTesting()) return;

    this.moderationLogger.info(message, data);
    prettyPrint('info', message, printData && data);
  }
}

function prettyPrint(level: string, message: string, data?: unknown) {
  let levelTag = '';
  if (level === 'info') levelTag = `[${chalk.cyan('INFO')}]`;
  if (level === 'error') levelTag = `[${chalk.redBright('ERROR')}]`;
  if (level === 'debug') levelTag = `[${chalk.greenBright('DEBUG')}]`;

  const formattedDate = chalk.gray(new Date().toLocaleTimeString('en-GB'));
  const formattedData = data ? `${chalk.gray(chalk.italic(JSON.stringify(data)))}` : '';

  console.log(levelTag, formattedDate, message, formattedData);
}

export default new Logger();
