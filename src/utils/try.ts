type AsyncFunction = () => Promise<any>;
type SyncFunction = () => any;

/**
 * Go-style error handling for async functions
 * Returns [error, result] - if error is null, result is valid
 * @example
 * const [error, user] = await asyncCatch(() => prisma.users.findUnique({ where: { id } }));
 * if (error) return res.status(500).json({ success: false, message: "Server error", error });
 * // use user safely
 */
export async function asyncCatch<T>(fn: AsyncFunction): Promise<[Error | null, T | null]> {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
}

/**
 * Go-style error handling for sync functions
 * Returns [error, result] - if error is null, result is valid
 */
export function syncCatch<T>(fn: SyncFunction): [Error | null, T | null] {
  try {
    const result = fn();
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
}
