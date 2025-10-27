// Logger utility
const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || 'INFO';

const log = (level, message, ...args) => {
  if (logLevels[level] <= logLevels[currentLevel]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`, ...args);
  }
};

const logger = {
  error: (message, ...args) => log('ERROR', message, ...args),
  warn: (message, ...args) => log('WARN', message, ...args),
  info: (message, ...args) => log('INFO', message, ...args),
  debug: (message, ...args) => log('DEBUG', message, ...args)
};

module.exports = logger;
