import logger from '../services/logging.service';

export async function handleServerInit(serverName: string, initFn: () => Promise<() => Promise<void>>) {
  let shutdownInProgress: Promise<void> | null = null;

  logger.info(`Starting ${serverName}...`);

  const cleanupFn = await initFn();

  const handleShutdown = async (signal: string) => {
    // If already shutting down, return the existing promise
    if (shutdownInProgress) {
      logger.info(`Shutdown already in progress (received ${signal})`);
      return shutdownInProgress;
    }

    logger.info(`Received ${signal}, shutting down gracefully...`);

    // Race cleanup against timeout
    shutdownInProgress = Promise.race([
      cleanupFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout after 30s')), 30_000))
    ])
      .then(() => {
        logger.info('Shutdown complete.');
        process.exit(0);
      })
      .catch(error => {
        logger.error('Error during shutdown:', error, true);
        process.exit(1);
      });

    return shutdownInProgress;
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('unhandledRejection', async reason => {
    logger.error('Unhandled Rejection:', reason, true);
    await handleShutdown('unhandledRejection');
  });

  process.on('uncaughtException', async error => {
    logger.error('Uncaught Exception:', error, true);
    await handleShutdown('unhandledRejection');
  });

  process.on('exit', code => {
    logger.info(`Process exiting with code ${code}`);
  });
}
