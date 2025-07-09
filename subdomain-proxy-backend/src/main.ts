import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import next from 'next';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as path from 'path';
import { SubdomainMiddleware } from './middleware/subdomain.middleware';
import Redis from 'ioredis';

async function bootstrap() {
  const server = express();

  const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
  });

  const subdomainMiddleware = new SubdomainMiddleware(redisClient);
  server.use((req, res, next) => {
    subdomainMiddleware.use(req, res, next);
  });

  const nextApps = {
    default: next({dev: true, dir: path.join(__dirname, '..', 'default')}),
    frontend: next({dev: true, dir: path.join(__dirname, '..', 'frontend')}),
    new: next({dev: true, dir: path.join(__dirname, '..', 'new')}),
  };

  await Promise.all([
    nextApps.default.prepare(),
    nextApps.frontend.prepare(),
    nextApps.new.prepare(),
  ]);

  // const frontend = next({
  //   dev: true,
  //   // dev: false,
  //   dir: path.join(__dirname, '..', 'frontend'),
  // });
  // const handle = frontend.getRequestHandler();
  // await frontend.prepare();

  server.use((req, res) => {
    let appName = req['appName'];
    let app = nextApps.default;
    if (appName === 'new') {
      app = nextApps.new;
    } else if (appName === 'frontend') {
      app = nextApps.frontend;
    }
    if (!app) {
      return res.status(404).send('App not found');
    }
    const handle = app.getRequestHandler();
    return handle(req, res);
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  await app.init();

  await app.listen(8000);
  console.log('http://localhost:8000');
}
bootstrap();