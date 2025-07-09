import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisProvider } from './redis/redis.provider';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RedisProvider],
})
export class AppModule {}
