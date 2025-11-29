import logger from '../services/logging.service';

export async function handleServerInit(serverName: string, initFn: () => Promise<() => Promise<void>>) {
  let isShuttingDown = false;

  logger.info(`Starting ${serverName}...`);

  const handleShutdown = await initFn().then(fn => {
    return async () => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;
      logger.info('Shutting down gracefully...');

      try {
        await fn();
        logger.info('Shutdown complete.');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error, true);
        process.exit(1);
      }
    };
  });

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);

  process.on('exit', code => {
    logger.info(`Process exiting with code ${code}`);
  });

  process.on('unhandledRejection', reason => {
    logger.error('Unhandled Rejection:', reason, true);
    handleShutdown();
  });

  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error, true);
    handleShutdown();
  });
}
