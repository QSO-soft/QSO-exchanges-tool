// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import weekOfYear from 'dayjs/plugin/weekOfYear';
// import { Repository } from 'typeorm';
// import { createPublicClient, http, PublicClient } from 'viem';
// import { base } from 'viem/chains';
//
// import settings from '../../../_inputs/settings/settings';
// import { CHECKERS_FOLDER } from '../../../constants';
// import {
//   checkMultipleOf,
//   convertToCsvAndWrite,
//   CryptoCompareResult,
//   DataForCsv,
//   FilterWallets,
//   formatHasThisMonthFilter,
//   formatMoreOrLessFilter,
//   getRpc,
// } from '../../../helpers';
// import { LoggerData, LoggerType } from '../../../logger';
// import { TIMESTAMP_FORMAT } from '../../../logger/constants';
// import { Networks, WalletData } from '../../../types';
// import { PROJECT_NAME } from '../constants';
// import { StatisticEntity } from '../db/entities';
// import { CombinedData, getStatisticData } from './get-statistic';
//
// dayjs.extend(utc);
// dayjs.extend(weekOfYear);
//
// export const filterWallets = async ({
//   wallets,
//   dbSource,
//   logger,
//   nativePrices,
// }: FilterWallets): Promise<WalletData[]> => {
//   const logTemplate: LoggerData = {
//     action: 'filterWallets',
//   };
//
//   const { useFilter, usePrevData, ...restFilters } = settings.filters;
//
//   const stringifiedFilters = JSON.stringify(restFilters);
//   logger.info(`Filtering wallets by ${stringifiedFilters}...`, {
//     ...logTemplate,
//   });
//
//   const { hasThisMonthTx, txCount, balanceETH, balanceUSDC, balanceDAI, days, months, weeks, volume, contracts } =
//     restFilters;
//
//   const batchSize = 10;
//   const batchCount = Math.ceil(wallets.length / batchSize);
//   const walletPromises: Promise<(CombinedData | null)[]>[] = [];
//
//   const dbRepo = dbSource.getRepository(StatisticEntity);
//
//   if (!usePrevData) {
//     const publicClient = createPublicClient({
//       chain: base,
//       transport: http(getRpc(Networks.BASE)),
//     }) as PublicClient;
//
//     await dbRepo.clear();
//
//     for (let i = 0; i < batchCount; i++) {
//       const startIndex = i * batchSize;
//       const endIndex = (i + 1) * batchSize;
//       const batch = wallets.slice(startIndex, endIndex);
//
//       const promise = new Promise<(CombinedData | null)[]>((resolve) => {
//         setTimeout(() => {
//           resolve(
//             fetchBatch({
//               batch,
//               dbRepo,
//               logger,
//               prices: nativePrices,
//               index: i,
//               publicClient,
//             })
//           );
//         }, i * 3000);
//       });
//
//       walletPromises.push(promise);
//     }
//
//     const promisesRes = await Promise.all(walletPromises);
//
//     const flattedRes = promisesRes.flat();
//     const failedRes = flattedRes.filter((data) => data === null) as null[];
//     const successRes = flattedRes.filter((data) => data !== null) as CombinedData[];
//
//     const fileName = `${PROJECT_NAME}-statistic`;
//
//     convertToCsvAndWrite({
//       data: successRes.map(
//         ({
//           balances,
//           wallet,
//           totalGasSpent,
//           totalGasSpentUsd,
//           firstTransactionDate,
//           lastTransactionDate,
//           totalVolume,
//           ...restStatistic
//         }) => ({
//           id: wallet.id,
//           walletAddress: wallet.walletAddress,
//           ...balances,
//           totalVolume,
//           ...restStatistic,
//           firstTransactionDate: firstTransactionDate
//             ? dayjs(firstTransactionDate).format(TIMESTAMP_FORMAT)
//             : firstTransactionDate,
//           lastTransactionDate: lastTransactionDate
//             ? dayjs(lastTransactionDate).format(TIMESTAMP_FORMAT)
//             : lastTransactionDate,
//           totalGasSpent,
//           totalGasSpentUsd,
//         })
//       ) as DataForCsv,
//       fileName: `${fileName}.csv`,
//       outputPath: CHECKERS_FOLDER,
//     });
//
//     if (failedRes.length) {
//       logger.error(`Unable to get statistic for ${failedRes.length} wallets`, logTemplate);
//     }
//
//     logger.success(`Statistic of wallets saved to _outputs/csv/checkers/${PROJECT_NAME}-statistic.csv`, logTemplate);
//   }
//
//   const filteredStatistic = await dbRepo.find({
//     where: {
//       ...formatMoreOrLessFilter(txCount, 'totalTxsCount'),
//       ...formatMoreOrLessFilter(balanceETH, 'ETH'),
//       ...formatMoreOrLessFilter(balanceUSDC, 'USDC'),
//       ...formatMoreOrLessFilter(balanceDAI, 'DAI'),
//       ...formatMoreOrLessFilter(volume, 'totalVolume'),
//       ...formatMoreOrLessFilter(days, 'uniqueDaysCount'),
//       ...formatMoreOrLessFilter(weeks, 'uniqueWeeksCount'),
//       ...formatMoreOrLessFilter(months, 'uniqueMonthsCount'),
//       ...formatMoreOrLessFilter(contracts, 'uniqueContractsCount'),
//       ...formatHasThisMonthFilter(hasThisMonthTx, 'lastTransactionDate'),
//     },
//   });
//   const filteredWallets = filteredStatistic.map(
//     ({ walletId, walletAddress, index, secondAddress, okxAddress, proxy_type, proxy, privKey }) => ({
//       id: walletId,
//       walletAddress,
//       index,
//       secondAddress,
//       okxAddress,
//       proxy_type,
//       proxy,
//       privKey,
//     })
//   );
//
//   logger.success(
//     `Got ${filteredWallets.length} filtered wallets from ${wallets.length} by ${stringifiedFilters} filters`,
//     logTemplate
//   );
//
//   return filteredWallets;
// };
//
// interface FetchBatch {
//   batch: WalletData[];
//   logger: LoggerType;
//   prices: CryptoCompareResult;
//   publicClient: PublicClient;
//   index: number;
//   dbRepo?: Repository<StatisticEntity>;
// }
// const fetchBatch = async ({ logger, dbRepo, batch, prices, index, publicClient }: FetchBatch) => {
//   const logTemplate: LoggerData = {
//     action: 'filterWallets',
//   };
//
//   const batchRes = await Promise.all(
//     batch.map((wallet) =>
//       getStatisticData(
//         {
//           wallet,
//           logger,
//           prices,
//           publicClient,
//           dbRepo,
//           withSaveToDb: true,
//         },
//         false
//       )
//     )
//   );
//
//   if (checkMultipleOf(10, index)) {
//     logger.info('Filtering still in progress...', logTemplate);
//   }
//
//   return batchRes;
// };
