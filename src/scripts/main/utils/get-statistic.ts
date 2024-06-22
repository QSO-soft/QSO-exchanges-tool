// import axios from 'axios';
// import dayjs from 'dayjs';
// import { Repository } from 'typeorm';
// import { formatEther, getAddress, Hex, PublicClient } from 'viem';
//
// import { defaultTokenAbi } from '../../../clients/abi';
// import {
//   createRandomProxyAgent,
//   CryptoCompareResult,
//   decimalToInt,
//   getAxiosConfig,
//   getHeaders,
//   getRandomNumber,
//   retry,
//   saveCheckerDataToCSV,
// } from '../../../helpers';
// import { LoggerData, LoggerType } from '../../../logger';
// import { TIMESTAMP_FORMAT } from '../../../logger/constants';
// import { BaseAxiosConfig, WalletData } from '../../../types';
// import { PROJECT_NAME } from '../constants';
// import { StatisticEntity } from '../db/entities';
//
// const API_URL = 'https://base.blockscout.com/api/v2';
//
// const STABLE_COINS_CONTRACTS = [
//   {
//     token: 'USDC',
//     address: getAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'),
//     decimals: 6,
//   },
//   {
//     token: 'DAI',
//     address: getAddress('0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'),
//     decimals: 18,
//   },
// ];
//
// interface StatisticArgs {
//   wallet: WalletData;
//   config: BaseAxiosConfig;
//   ethPrice: number;
//   publicClient: PublicClient;
// }
// type Balances = Record<string, number>;
//
// const getWalletBalancesRpc = async ({ publicClient, wallet, ethPrice }: StatisticArgs) => {
//   const walletAddress = wallet.walletAddress as Hex;
//
//   const ethBalance = await publicClient.getBalance({ address: walletAddress as Hex });
//   const ethBalanceInt = Number(formatEther(ethBalance));
//
//   const allBalances: Balances = {
//     ETH: ethBalanceInt,
//     ETH_USD: +(ethBalanceInt * ethPrice).toFixed(5),
//   };
//
//   for (const stableData of STABLE_COINS_CONTRACTS) {
//     const stableBalance = (await publicClient.readContract({
//       address: stableData.address,
//       abi: defaultTokenAbi,
//       functionName: 'balanceOf',
//       args: [walletAddress],
//     })) as bigint;
//
//     const stableBalanceInt = decimalToInt({ amount: stableBalance, decimals: stableData.decimals });
//
//     allBalances[stableData.token] = +stableBalanceInt.toFixed(5);
//   }
//
//   return allBalances;
// };
// interface Transactions {
//   totalTxsCount: number;
//   totalGasSpent: number;
//   totalGasSpentUsd: number;
//   uniqueDaysCount: number;
//   uniqueWeeksCount: number;
//   uniqueMonthsCount: number;
//   uniqueContractsCount: number;
//   totalVolume: number;
//   firstTransactionDate: Date | null;
//   lastTransactionDate: Date | null;
// }
// const getWalletTxs = async ({ config, wallet, ethPrice }: StatisticArgs): Promise<Transactions> => {
//   const uniqueDays = new Set();
//   const uniqueWeeks = new Set();
//   const uniqueMonths = new Set();
//   const uniqueContracts = new Set();
//
//   let totalGasSpent = 0;
//   let totalVolume = 0;
//
//   const txs = [];
//   let isAllDataFetched = false;
//
//   let params: any = {};
//   while (!isAllDataFetched) {
//     const { data } = await axios.get(`${API_URL}/addresses/${wallet.walletAddress}/transactions`, {
//       params,
//       ...config,
//     });
//
//     for (const tx of data.items) {
//       // && tx.result === 'success'
//       if (tx.from.hash.toLowerCase() === wallet.walletAddress.toLowerCase()) {
//         txs.push(tx);
//       }
//     }
//
//     if (data.next_page_params === null) {
//       isAllDataFetched = true;
//     } else {
//       params = data.next_page_params;
//     }
//   }
//
//   for (const tx of txs) {
//     const date = dayjs(tx.timestamp);
//
//     const month = date.year() + '-' + date.month();
//     const week = date.year() + '-' + date.week();
//     const day = month + '-' + date.date();
//
//     uniqueDays.add(day);
//     uniqueWeeks.add(week);
//     uniqueMonths.add(month);
//
//     if (tx.to) {
//       uniqueContracts.add(tx.to.hash);
//     }
//
//     totalGasSpent += parseInt(tx.fee.value) / Math.pow(10, 18);
//     totalVolume += (parseInt(tx.value) / Math.pow(10, 18)) * ethPrice;
//   }
//
//   const uniqueDaysCount = uniqueDays.size;
//   const uniqueWeeksCount = uniqueWeeks.size;
//   const uniqueMonthsCount = uniqueMonths.size;
//   const uniqueContractsCount = uniqueContracts.size;
//
//   const totalTxsCount = txs.length;
//
//   const firstTransactionDate = txs.at(-1)?.timestamp;
//   const lastTransactionDate = txs.at(0)?.timestamp;
//
//   return {
//     totalVolume,
//     totalTxsCount,
//     uniqueContractsCount,
//     uniqueDaysCount,
//     uniqueWeeksCount,
//     uniqueMonthsCount,
//     totalGasSpent: +totalGasSpent.toFixed(7),
//     totalGasSpentUsd: +(totalGasSpent * ethPrice).toFixed(7),
//     firstTransactionDate,
//     lastTransactionDate,
//   };
// };
//
// type StatisticDataArgs = {
//   wallet: WalletData;
//   prices: CryptoCompareResult;
//   logger: LoggerType;
//   publicClient: PublicClient;
//   withSaveToDb?: boolean;
//   dbRepo?: Repository<StatisticEntity>;
// };
//
// export type CombinedData = {
//   balances: Balances;
//   wallet: WalletData;
// } & Transactions;
// export const getCombinedData = async ({
//   wallet,
//   logger,
//   prices,
//   publicClient,
// }: StatisticDataArgs): Promise<CombinedData | null> => {
//   const ethPrice = prices['ETH'];
//   if (!ethPrice) {
//     throw new Error('Unable to get ETH price');
//   }
//
//   const logTemplate: LoggerData = {
//     action: 'getStatisticData',
//   };
//
//   const retryConfig = {
//     baseDelayMs: getRandomNumber([3, 5], true),
//     retryCount: 15,
//     withThrowErr: false,
//   };
//
//   const proxyData = await createRandomProxyAgent();
//
//   const headers = getHeaders();
//   const config = await getAxiosConfig({
//     proxyAgent: proxyData?.proxyAgent,
//     headers,
//   });
//
//   const baseArgs = { wallet, ethPrice, config, publicClient };
//
//   const balancesData = await retry({
//     callback: async () => getWalletBalancesRpc(baseArgs),
//     ...retryConfig,
//   });
//   const txsData = await retry({
//     callback: async () => getWalletTxs(baseArgs),
//     ...retryConfig,
//   });
//
//   if (txsData && balancesData) {
//     return {
//       balances: balancesData,
//       ...txsData,
//       wallet,
//     };
//   } else {
//     logger.error('Unable to get statistic', {
//       ...logTemplate,
//       wallet,
//     });
//
//     return null;
//   }
// };
//
// export const getStatisticData = async (params: StatisticDataArgs, withLog = true) => {
//   const { withSaveToDb = false, dbRepo, logger } = params;
//   const combinedData = await getCombinedData(params);
//
//   if (combinedData) {
//     const {
//       balances,
//       wallet,
//       totalGasSpent,
//       totalGasSpentUsd,
//       firstTransactionDate,
//       lastTransactionDate,
//       totalVolume,
//       ...restStatistic
//     } = combinedData;
//     const fileName = `${PROJECT_NAME}-statistic`;
//     await saveCheckerDataToCSV({
//       data: {
//         id: wallet.id,
//         walletAddress: wallet.walletAddress,
//         ...balances,
//         totalVolume,
//         ...restStatistic,
//         firstTransactionDate: firstTransactionDate
//           ? dayjs(firstTransactionDate).format(TIMESTAMP_FORMAT)
//           : firstTransactionDate,
//         lastTransactionDate: lastTransactionDate
//           ? dayjs(lastTransactionDate).format(TIMESTAMP_FORMAT)
//           : lastTransactionDate,
//         totalGasSpent,
//         totalGasSpentUsd,
//       },
//       fileName,
//     });
//
//     if (withLog) {
//       logger.success(`Statistic of wallet saved to _outputs/csv/checkers/${PROJECT_NAME}-statistic.csv`);
//     }
//
//     if (withSaveToDb && dbRepo) {
//       await addToDb(combinedData, dbRepo);
//     }
//   }
//
//   return combinedData;
// };
//
// const addToDb = async (combinedData: CombinedData, dbRepo: Repository<StatisticEntity>) => {
//   const { balances, wallet, ...txsData } = combinedData;
//   const { id, ...restWalletData } = wallet;
//   const created = dbRepo.create({
//     ...txsData,
//     ...balances,
//     ...restWalletData,
//     walletId: id,
//   });
//
//   await dbRepo.save(created);
// };
