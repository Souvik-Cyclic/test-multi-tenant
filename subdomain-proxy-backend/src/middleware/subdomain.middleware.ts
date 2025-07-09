import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisClient } from 'src/redis/redis.provider';
import { RESTRICTED_SUBDOMAINS } from 'src/common/constants';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host;
    const hostParts = host?.split('.') || [];
    let appName: string | undefined;
    let userName: string | undefined;
    if (hostParts.length >3) return res.status(400).send('Invalid host format');
    if (hostParts.length == 3) {
      appName = hostParts[0];
      userName = hostParts[1];
    } else if (hostParts.length == 2) {
      userName = hostParts[0];
    }
    console.log('App name: ', appName);
    console.log('User name: ', userName);

    if (!userName || (appName && RESTRICTED_SUBDOMAINS.includes(appName))) {
      return res.status(403).send('Subdomain not allowed');
    }

    try {
      const start = Date.now();

      const exists = await this.redisClient.exists(userName);

      console.log(`Check for username "${userName}" took ${Date.now() - start}ms`);

      if (!exists) {
        return res.status(404).send('Subdomain not found');
      }

      req['appName'] = appName;
      req['userName'] = userName;
      // req['subdomain'] = subdomain;
      next();
    } catch (err) {
      console.error('Redis error:', err);
      return res.status(500).send('Internal Server Error');
    }
  }
}
