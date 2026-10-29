const cache = new Map();
const pendingRequests = new Map();

const DEFAULT_TTL = 60 * 1000; // 60 seconds

export function getCache(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache(key, value, ttl = DEFAULT_TTL) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
    pendingRequests.delete(key);
    return;
  }

  cache.clear();
  pendingRequests.clear();
}

export async function asyncCache(key, fetchData, ttl = DEFAULT_TTL) {
  const cached = getCache(key);

  if (cached !== null) {
    return cached;
  }

  // Reuse an in-progress request for this cache key.
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = (async () => {
    try {
      const value = await fetchData();
      setCache(key, value, ttl);
      return value;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, request);

  return request;
}
