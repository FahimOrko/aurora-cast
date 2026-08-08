import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 0, // no default TTL — every set() call specifies its own
  checkperiod: 120, // sweep expired keys every 2 min
});

async function wrap<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) return cached;

  const value = await fn();
  cache.set(key, value, ttlSeconds);
  return value;
}

function del(key: string): void {
  cache.del(key);
}

function flush(): void {
  cache.flushAll();
}

export const memoryCache = {
  wrap,
  delete: del,
  flush,
};
