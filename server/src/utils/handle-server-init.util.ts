import logger from '../services/logging.service';

export async function handleServerInit(initServerFn: () => Promise<() => Promise<void>>) {
  const handleShutdown = await initServerFn().then(fn => {
    return async () => {
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
