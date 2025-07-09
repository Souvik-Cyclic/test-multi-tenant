import { Provider } from "@nestjs/common";
import Redis from "ioredis";

export type RedisClient = Redis;

export const RedisProvider: Provider = {
    provide: "REDIS_CLIENT",
    useFactory: () => {
        return new Redis({
            host: "localhost",
            port: 6379,
        });
    },
};
