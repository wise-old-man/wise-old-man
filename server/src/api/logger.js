const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

function error(message, data) {
  logger.error(message, { ...data, date: new Date() });
}

function info(message, data) {
  logger.info(message, { ...data, date: new Date() });
}

module.exports = { error, info };
