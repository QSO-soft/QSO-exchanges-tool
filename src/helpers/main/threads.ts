import { LoggerType } from '../../logger';
import { chunkArray } from '../utils';

interface StartWithThreads<T> {
  size: number;
  array: T[];
  callback: (arrayItem: T, logger: LoggerType, currentItemIndex: number) => Promise<any>;
  logger: LoggerType;
}
export const startWithThreads = async <T>({ size, array, callback, logger }: StartWithThreads<T>) => {
  const totalCount = array.length;
  let finishCount = 0;
  const chunkedArray = chunkArray(array, size);

  const allResults = [];

  for (const chunk of chunkedArray) {
    const promises = [];
    const currentIndex = finishCount + chunk.length;

    for (const chunkItem of chunk) {
      const promise = callback(chunkItem, logger, currentIndex);
      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);
    finishCount = currentIndex;
    logger.success(`Total wallets: [${finishCount}/${totalCount}]`, { action: 'startWithThreads' });
    allResults.push(results);
  }

  return allResults;
};
