import logger from '../services/logging.service';

export async function handleServerInit(serverName: string, initFn: () => Promise<() => Promise<void>>) {
  let shutdownInProgress: Promise<void> | null = null;

  logger.info(`Starting ${serverName}...`);

  const cleanupFn = await initFn();

  const handleShutdown = async (signal: string) => {
    if (shutdownInProgress) {
      logger.info(`Shutdown already in progress (received ${signal})`);
      return shutdownInProgress;
    }

    logger.info(`Received ${signal}, shutting down gracefully...`);

    shutdownInProgress = Promise.race([
      cleanupFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout after 60s')), 60_000))
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
    await handleShutdown('uncaughtException');
  });

  process.on('exit', code => {
    logger.info(`Process exiting with code ${code}`);
  });
}
