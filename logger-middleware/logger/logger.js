import { sendLog } from './logClient.js';

/**
 * Log wrapper function for reuse across backend apps.
 * @param {string} level - Log level: debug, info, warn, error, fatal
 * @param {string} pkg - Package: service, handler, db, route, etc.
 * @param {string} message - Human-readable message
 */
export const Log = async (level, pkg, message) => {
  return await sendLog('backend', level, pkg, message);
};
