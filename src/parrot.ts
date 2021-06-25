import { createNodeRedisClient } from 'handy-redis';

export interface Parrot {
  add: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | undefined>;
  // list: () => Promise<[string, string][]>;
  del: (key: string) => Promise<boolean>;
}

// Just one possible implementation.
export class RedisParrot implements Parrot {
  private client = createNodeRedisClient();
  private key = 'zulip-lichess-parrot';

  add = async (key: string, value: string) => {
    await this.client.hset(this.key, [key, value]);
  };

  get = async (key: string) => await this.client.hget(this.key, key);

  del = async (key: string) => {
    const nb = await this.client.hdel(this.key, key);
    return nb > 0;
  };

  // list = async () => await this.client.hgetall(this.key);
}
