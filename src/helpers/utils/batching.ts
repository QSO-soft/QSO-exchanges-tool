import chunk from 'lodash/chunk';

import type { LoggerData, LoggerType } from '../../logger';
import { sleep } from './sleep';

type Callback<T> = (batch: T) => Promise<unknown>;

// split array to sub-arrays of passed size
export const chunkArray = <T>(array: T[], size: number): T[][] => chunk(array, size);

interface ProcessBatchesWithInterval<T> {
  chunks: T[];
  interval: number;
  callback: Callback<T>;
  logTemplate?: LoggerData;
  logger?: LoggerType;
}

export const processBatchesWithInterval = async <T>({
  chunks,
  interval,
  callback,
  logTemplate,
  logger,
}: ProcessBatchesWithInterval<T>) => {
  for (const chunk of chunks) {
    try {
      await callback(chunk);
    } catch (error) {
      logger?.error('Error with processing this data', logTemplate);
    }

    if (chunk !== chunks[chunks.length - 1]) {
      // interval before next chunk start
      logger?.info(`Delay: ${interval / 1000}s`, logTemplate);
      await sleep(interval);
    }
  }
};

export interface ProcessChunksProps<T> {
  retryCount: number;
  delayBetweenRetries: number;
  callback: Callback<T>;
  logTemplate?: LoggerData;
  logger?: LoggerType;
}

export interface ProcessChunkWithRetryProps<T> extends ProcessChunksProps<T> {
  chunk: T[];
}
// process chunk of data and retry failed requests
export const processChunkWithRetry = async <T>({
  chunk,
  retryCount,
  delayBetweenRetries,
  callback,
  logTemplate,
  logger,
}: ProcessChunkWithRetryProps<T>): Promise<PromiseSettledResult<unknown>[]> => {
  const results = await Promise.allSettled(chunk.map(callback));

  const failedCallbacks = results.filter((result) => result.status === 'rejected');

  if (failedCallbacks.length > 0 && retryCount > 0) {
    logger?.info(`Delay between retries: ${delayBetweenRetries}s`, logTemplate);

    await sleep(delayBetweenRetries);

    return processChunkWithRetry({
      chunk: failedCallbacks.map((result) => 'reason' in result && result.reason),
      retryCount: retryCount - 1,
      delayBetweenRetries,
      callback,
    });
  }

  return results;
};

export interface ProcessChunksWithDelayAndRetryProps<T> extends ProcessChunksProps<T> {
  chunks: T[][];
  delayBetweenChunks: number;
}

// Function to process batches with a delay
export const processChunksWithDelayAndRetry = async <T>({
  chunks,
  delayBetweenChunks,
  logTemplate,
  logger,
  ...rest
}: ProcessChunksWithDelayAndRetryProps<T>): Promise<PromiseSettledResult<unknown>[]> => {
  const allResults: PromiseSettledResult<unknown>[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const isNotFirstChunk = index > 0;

    if (isNotFirstChunk) {
      logger?.info(`Delay between chunks: ${delayBetweenChunks}s`, logTemplate);

      await sleep(delayBetweenChunks);
    }

    const batchResults = await processChunkWithRetry({ chunk, logger, logTemplate, ...rest });
    allResults.push(...batchResults);
  }

  return allResults;
};
