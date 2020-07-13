import winston from 'winston';

class Logger {
  private logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  error(message, data) {
    this.logger.error(message, { ...data, date: new Date() });
  }

  info(message, data) {
    this.logger.info(message, { ...data, date: new Date() });
  }
}

export default new Logger();
