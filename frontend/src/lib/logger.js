// Simple logging for debugging — mature, quiet in prod
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export const logger = {
  log: (...args) => { if (isDev) console.log('[Alpha]', ...args); },
  error: (...args) => console.error('[Alpha Error]', ...args),
  warn: (...args) => console.warn('[Alpha Warn]', ...args),
  info: (...args) => { if (isDev) console.info('[Alpha]', ...args); },
};

export default logger;
