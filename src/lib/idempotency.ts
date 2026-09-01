// ============================================================================
// STRIPOO - IDEMPOTENCY LOCK & REPLAY PROTECTION ENGINE
// ============================================================================
// Prevents duplicate transactions across network retries.

interface CachedIdempotencyRecord {
  key: string;
  requestHash: string;
  statusCode: number;
  response: any;
  createdAt: number;
  status: 'PROCESSING' | 'COMPLETED';
}

class IdempotencyEngine {
  private cache = new Map<string, CachedIdempotencyRecord>();

  private computeHash(body: any): string {
    return JSON.stringify(body || {});
  }

  /**
   * Checks if an idempotency key exists or acquires an in-flight lock.
   */
  public evaluate(key: string, requestBody: any): {
    isReplay: boolean;
    isConflict: boolean;
    cachedResponse?: { statusCode: number; response: any };
  } {
    const record = this.cache.get(key);
    const bodyHash = this.computeHash(requestBody);

    if (record) {
      if (record.status === 'PROCESSING') {
        return { isReplay: false, isConflict: true };
      }

      if (record.requestHash !== bodyHash) {
        throw new Error(
          `Idempotency Key '${key}' was already used with a different request payload.`
        );
      }

      return {
        isReplay: true,
        isConflict: false,
        cachedResponse: {
          statusCode: record.statusCode,
          response: record.response,
        },
      };
    }

    // Set lock
    this.cache.set(key, {
      key,
      requestHash: bodyHash,
      statusCode: 0,
      response: null,
      createdAt: Date.now(),
      status: 'PROCESSING',
    });

    return { isReplay: false, isConflict: false };
  }

  /**
   * Finalizes the record with the final HTTP response payload.
   */
  public finalize(key: string, statusCode: number, response: any) {
    const record = this.cache.get(key);
    if (record) {
      record.statusCode = statusCode;
      record.response = response;
      record.status = 'COMPLETED';
    }
  }
}

export const idempotency = new IdempotencyEngine();
