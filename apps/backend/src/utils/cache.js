
const cache = new Map();
const pendingRequests = new Map();

const DEFAULT_TTL = 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

let cacheHits = 0;
let cacheMisses = 0;

function validateKey(key) {
  if (typeof key !== "string" || !key.trim()) {
    throw new Error("Cache key must be a non-empty string.");
  }
}

function normalizeTTL(ttl) {
  const value = Number(ttl);

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_TTL;
  }

  return value;
}

export function getCache(key) {
  validateKey(key);

  const entry = cache.get(key);

  if (!entry) {
    cacheMisses++;
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    cacheMisses++;
    return null;
  }

  // Move the entry to the end to support LRU eviction.
  cache.delete(key);
  cache.set(key, entry);

  cacheHits++;

  return entry.value;
}

export function setCache(key, value, ttl = DEFAULT_TTL) {
  validateKey(key);

  const expiresAt = Date.now() + normalizeTTL(ttl);

  // Replace existing entry to refresh its insertion order.
  cache.delete(key);

  // Remove the oldest entry if the cache is full.
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, {
    value,
    expiresAt,
  });

  return value;
}

export function clearCache(key) {
  if (key !== undefined) {
    validateKey(key);

    cache.delete(key);

    // Do not delete an active request here.
    // Its original callers should still receive its result.
    // Its result must not repopulate the cache after clearing.
    const pending = pendingRequests.get(key);

    if (pending) {
      pending.cancelCacheWrite = true;
    }

    return;
  }

  cache.clear();

  // Prevent all active requests from writing stale data.
  for (const pending of pendingRequests.values()) {
    pending.cancelCacheWrite = true;
  }

  cacheHits = 0;
  cacheMisses = 0;
}

export async function asyncCache(
  key,
  fetchData,
  ttl = DEFAULT_TTL,
) {
  validateKey(key);

  if (typeof fetchData !== "function") {
    throw new Error("fetchData must be a function.");
  }

  const cached = getCache(key);

  if (cached !== null) {
    return cached;
  }

  // Reuse an in-progress request for the same key.
  const existingRequest = pendingRequests.get(key);

  if (existingRequest) {
    return existingRequest.promise;
  }

  const request = {
    cancelCacheWrite: false,
    promise: null,
  };

  request.promise = (async () => {
    try {
      const value = await fetchData();

      // Cache only if the request has not been invalidated.
      if (!request.cancelCacheWrite) {
        setCache(key, value, ttl);
      }

      return value;
    } finally {
      // Delete only this request, not a newer request
      // that may have replaced it.
      if (pendingRequests.get(key) === request) {
        pendingRequests.delete(key);
      }
    }
  })();

  pendingRequests.set(key, request);

  return request.promise;
}

export function getCacheStats() {
  return {
    entries: cache.size,
    pendingRequests: pendingRequests.size,
    cacheHits,
    cacheMisses,
  };
}
