import type { LoggerData, LoggerType } from '../../logger';
import { sleep } from './sleep';

interface RetryProps<T> {
  callback: (...args: unknown[]) => Promise<T>;
  maxAttempts?: number;
  baseDelayMs?: number;
  triggerErrorMessages?: string[];
  logger?: LoggerType;
  logTemplate?: LoggerData;
  withThrowErr?: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const retry = async <T>({
  callback,
  triggerErrorMessages,
  maxAttempts = 3,
  baseDelayMs = 1,
  logger,
  logTemplate,
  withThrowErr = true,
}: RetryProps<T>) => {
  let attempt = 1;
  let result: T | undefined = undefined;

  while (attempt <= maxAttempts && !result) {
    try {
      result = await callback();
    } catch (error) {
      const errorMessage = (error as Error)?.message ?? 'unknown error';

      logger?.error(`Attempt ${attempt} failed: ${errorMessage}`, logTemplate);

      const hasExitError =
        triggerErrorMessages && triggerErrorMessages.some((triggerErrorMsg) => errorMessage.includes(triggerErrorMsg));

      if (hasExitError && withThrowErr) {
        throw new Error(errorMessage);
      }

      if (attempt < maxAttempts) {
        const delayMs = Math.pow(2, attempt - 1) * baseDelayMs;
        logger?.info(`Next attempt will be in ${delayMs} s`, logTemplate);

        await sleep(delayMs);
        attempt++;
      } else {
        const errorMessageAllAttempts = `All ${maxAttempts} attempts were failed`;

        logger?.error(errorMessageAllAttempts, logTemplate);
        if (withThrowErr) {
          throw new Error(errorMessage);
        } else {
          return;
        }
      }
    }
  }

  return result;
};
