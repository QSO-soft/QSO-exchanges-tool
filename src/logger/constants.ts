export const LOGS_PATH = './logs';
export const COMBINED_LOGS = 'combined.log';

export const TIMESTAMP_FORMAT = 'DD-MM-YYYY HH:mm:ss';

export const LEVELS_NAMES = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
};

export const LEVELS = {
  [LEVELS_NAMES.error]: 0,
  [LEVELS_NAMES.warning]: 1,
  [LEVELS_NAMES.success]: 2,
  [LEVELS_NAMES.info]: 3,
};

export const LEVELS_COLORS = {
  [LEVELS_NAMES.error]: 'red',
  [LEVELS_NAMES.warning]: 'yellow',
  [LEVELS_NAMES.success]: 'green',
  [LEVELS_NAMES.info]: 'brightWhite',
};
