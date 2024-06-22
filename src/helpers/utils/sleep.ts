import type { LoggerType, LoggerData } from '../../logger';
import type { NumberRange } from '../../types';
import { getRandomNumber } from './randomizers';

export const sleep = async (
  seconds: number,
  logTemplate?: LoggerData,
  innerLogger?: LoggerType,
  customMessage?: string
): Promise<void> => {
  const logMessage = customMessage || `Fell asleep for ${seconds} seconds`;
  innerLogger?.info(logMessage, logTemplate);

  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const sleepByRange = async (delayRange: NumberRange, logTemplate?: LoggerData, innerLogger?: LoggerType) => {
  const delay = getRandomNumber(delayRange, true);

  return sleep(delay, logTemplate, innerLogger);
};
