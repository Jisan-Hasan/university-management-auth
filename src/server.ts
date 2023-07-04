import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { errorLogger, logger } from './shared/logger';

// handle uncaught exception
process.on('uncaughtException', err => {
  errorLogger.error(err);
  process.exit(1);
});

let server: Server;
async function bootstrap() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(`🗄️ Database connected successfully.`);

    server = app.listen(config.port, () => {
      logger.info(`App is listening on port ${config.port}`);
    });
  } catch (error) {
    errorLogger.error('Failed to connect Database', error);
  }

  // unhandled rejection handled
  process.on('unhandledRejection', err => {
    errorLogger.error(err);
    if (server) {
      server.close(() => {
        errorLogger.error(err);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

bootstrap();

// console.log(x)

process.on('SIGTERM', () => {
  logger.info('SIGTERM is received');
  if (server) {
    server.close();
  }
});
