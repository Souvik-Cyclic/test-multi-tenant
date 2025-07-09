import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SubdomainMiddleware } from './middleware/subdomain.middleware';
import { RedisClient } from './redis/redis.provider';
import next from 'next';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.use(server);

  const redisClient = app.get<RedisClient>('REDIS_CLIENT');
  const middleware = new SubdomainMiddleware(redisClient);

  app.use(middleware.use.bind(middleware));
  const frontend = next({
    dev: false,
    dir: './frontend/.next',
  })

  const handle = frontend.getRequestHandler();
  await frontend.prepare();

  await app.init();
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  await app.listen(8000);
}
bootstrap();
