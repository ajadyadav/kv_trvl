interface RateLimitRecord {
  timestamps: number[];
}

const limiterMap = new Map<string, RateLimitRecord>();

export interface RateLimiterOptions {
  intervalMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // e.g. 20 requests
}

/**
 * Checks if a request from a specific identifier (like IP address) is rate limited.
 * Returns true if rate limited (blocked), false otherwise.
 */
export function isRateLimited(
  identifier: string,
  options: RateLimiterOptions
): { limited: boolean; currentCount: number; limit: number; resetTime: number } {
  const now = Date.now();
  const cutoff = now - options.intervalMs;

  let record = limiterMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    limiterMap.set(identifier, record);
  }

  // Filter out timestamps outside the window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= options.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + options.intervalMs;
    return {
      limited: true,
      currentCount: record.timestamps.length,
      limit: options.maxRequests,
      resetTime,
    };
  }

  // Record this request
  record.timestamps.push(now);
  
  // Calculate reset time from oldest timestamp in window (or now)
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTime = oldestTimestamp + options.intervalMs;

  return {
    limited: false,
    currentCount: record.timestamps.length,
    limit: options.maxRequests,
    resetTime,
  };
}

/**
 * Clean up stale keys in memory to prevent memory leaks.
 * Can be run periodically.
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  for (const [key, val] of limiterMap.entries()) {
    // If all timestamps are older than 1 hour, delete key
    if (val.timestamps.every((ts) => ts < oneHourAgo)) {
      limiterMap.delete(key);
    }
  }
}
