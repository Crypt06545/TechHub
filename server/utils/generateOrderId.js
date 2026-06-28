/**
 * Generates a human-readable unique order ID.
 * Format: SE-<TIMESTAMP_BASE36>-<RANDOM_4>
 * Example: SE-M0JXY2K1-AB3F
 */
export const generateOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SE-${ts}-${rand}`;
};
