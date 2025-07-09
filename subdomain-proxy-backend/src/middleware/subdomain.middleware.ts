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
    const subdomain = host?.split('.')[0];
    // photo.name.ourdomain
    // name.ourdomain
    console.log('Subdomain:', subdomain);
    if (!subdomain || RESTRICTED_SUBDOMAINS.includes(subdomain)) {
      return res.status(403).send('Subdomain not allowed');
    }

    try {
      const start = Date.now();

      const exists = await this.redisClient.exists(subdomain);

      console.log(`Check for subdomain "${subdomain}" took ${Date.now() - start}ms`);

      if (!exists) {
        return res.status(404).send('Subdomain not found');
      }

      req['subdomain'] = subdomain;
      next();
    } catch (err) {
      console.error('Redis error:', err);
      return res.status(500).send('Internal Server Error');
    }
  }
}
