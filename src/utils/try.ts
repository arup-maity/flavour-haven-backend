/**
 * Go-style error handling for TypeScript/Node.js
 * Returns [error, result] tuples instead of throwing
 */

type Result<T, E = Error> = [E, null] | [null, T];

/**
 * Wraps a promise to return [error, result] tuple
 * @param promise - Promise to wrap
 * @returns Tuple of [error, null] or [null, result]
 */
export async function catchAsync<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
   try {
      const data = await promise;
      return [null, data];
   } catch (error) {
      return [error as E, null];
   }
}

/**
 * Wraps a synchronous function to return [error, result] tuple
 * @param fn - Function to execute
 * @returns Tuple of [error, null] or [null, result]
 */
export function catchSync<T, E = Error>(fn: () => T): Result<T, E> {
   try {
      const data = fn();
      return [null, data];
   } catch (error) {
      return [error as E, null];
   }
}

/**
 * Wraps an async function to return [error, result] tuple
 * @param fn - Async function to execute
 * @returns Promise resolving to tuple of [error, null] or [null, result]
 */
export async function catchFn<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>> {
   return catchAsync(fn());
}