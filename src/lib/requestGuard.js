/**
 * Frontend Request Guard
 * Prevents infinite loops, duplicate requests, and manages request deduplication
 */

// Store for tracking pending requests
const pendingRequests = new Map();
const REQUEST_DEDUP_WINDOW = 2000; // 2 seconds - prevent duplicate requests within 2 seconds

// Store for request retry counts
const retryCounts = new Map();
const MAX_RETRIES = 3;

/**
 * Generate a unique key for a request
 */
function getRequestKey(config) {
  const method = config.method || 'GET';
  const url = typeof config === 'string' ? config : config.url;
  const data = config.data ? JSON.stringify(config.data).substring(0, 100) : '';
  return `${method}:${url}:${data}`;
}

/**
 * Request deduplication - prevents duplicate requests
 */
export const deduplicateRequest = async (requestFn, config) => {
  const key = getRequestKey(config);
  const now = Date.now();
  
  // Check if there's a pending request with the same key
  if (pendingRequests.has(key)) {
    const pending = pendingRequests.get(key);
    
    // If request is still pending and within dedup window, return the same promise
    if (now - pending.timestamp < REQUEST_DEDUP_WINDOW && pending.promise) {
      console.log(`🔄 Deduplicating request: ${config.url || config}`);
      return pending.promise;
    }
    
    // Clean up old pending request
    pendingRequests.delete(key);
  }
  
  // Create new request
  const promise = requestFn(config);
  
  // Store pending request
  pendingRequests.set(key, {
    promise,
    timestamp: now,
  });
  
  // Clean up after request completes
  promise
    .finally(() => {
      setTimeout(() => {
        pendingRequests.delete(key);
      }, REQUEST_DEDUP_WINDOW);
    })
    .catch(() => {
      // Remove on error too
      pendingRequests.delete(key);
    });
  
  return promise;
};

/**
 * Request retry with exponential backoff
 */
export const retryRequest = async (requestFn, config, retries = MAX_RETRIES) => {
  const key = getRequestKey(config);
  let attempt = retryCounts.get(key) || 0;
  
  try {
    const response = await requestFn(config);
    // Reset retry count on success
    retryCounts.delete(key);
    return response;
  } catch (error) {
    attempt++;
    retryCounts.set(key, attempt);
    
    // Don't retry on 4xx errors (client errors)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      retryCounts.delete(key);
      throw error;
    }
    
    // Don't retry if max retries reached
    if (attempt >= retries) {
      retryCounts.delete(key);
      throw error;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, attempt - 1) * 1000;
    console.log(`🔄 Retrying request (attempt ${attempt}/${retries}) after ${delay}ms: ${config.url || config}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, config, retries);
  }
};

/**
 * Request timeout wrapper
 */
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  
  // Clean up old pending requests
  for (const [key, value] of pendingRequests.entries()) {
    if (now - value.timestamp > REQUEST_DEDUP_WINDOW * 2) {
      pendingRequests.delete(key);
    }
  }
  
  // Clean up old retry counts
  for (const [key, value] of retryCounts.entries()) {
    if (now - value.timestamp > 60000) { // 1 minute
      retryCounts.delete(key);
    }
  }
}, 10000); // Clean up every 10 seconds

















