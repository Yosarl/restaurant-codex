import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { initSocket } from './config/socket';
import { startSchedulers } from './services/scheduler.service';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const server = http.createServer(app);
  initSocket(server);
  startSchedulers();

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on :${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
