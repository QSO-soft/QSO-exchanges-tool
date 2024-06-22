// import settings from '../../_inputs/settings/settings';
// import { getRandomNumber, TransactionCallbackParams } from '../../helpers';
// import { LoggerData } from '../../logger';
// import {
//   AutoGasNetworkSettings,
//   BINANCE_NETWORKS,
//   BinanceNetworks,
//   OKX_NETWORKS,
//   OkxNetworks,
//   OptionalNetworksArray,
//   SupportedNetworks,
//   Tokens,
// } from '../../types';
// import { AutoGasNetworks } from './types';
//
// // interface AutoGasProps extends LoggerProp {
// //   client: ClientType;
// //   network: SupportedNetworks | BinanceNetworks;
// //   wallet: WalletData;
// //   nativePrices: CryptoCompareResult;
// // }
//
// export const runAutoGas = async (params: TransactionCallbackParams) => {
//   const { wallet, logger, client, network, nativePrices } = params;
//   const logTemplate: LoggerData = {
//     action: 'runAutoGas',
//   };
//
//   const { autoGas } = settings;
//
//   const currentAutoGasNetwork = AUTOGAS_SETTING_MAP[network];
//
//   if (!currentAutoGasNetwork || !(currentAutoGasNetwork in autoGas)) {
//     return;
//   }
//
//   const currentAutoGas = autoGas[currentAutoGasNetwork] as AutoGasNetworkSettings;
//   const { useAutoGas, minBalance, withdrawToAmount, withdrawSleep, cex, expectedBalance } = currentAutoGas;
//
//   const nativeToken = client.chainData.nativeCurrency.symbol;
//   const { int: currentBalance } = await client.getNativeBalance();
//   if (!useAutoGas) {
//     return;
//   }
//
//   if (currentBalance >= minBalance) {
//     return;
//   }
//
//   const baseWithdrawArgs = {
//     wallet,
//     waitTime: getRandomNumber(withdrawSleep, true),
//     nativePrices,
//     tokenToWithdraw: nativeToken as Tokens,
//     minAndMaxAmount: withdrawToAmount,
//     minAmount: 0,
//     useUsd: false,
//     usePercentBalance: false,
//     minTokenBalance: 0,
//     minDestTokenBalance: 0,
//     randomNetworks: [] as OptionalNetworksArray,
//     minNativeBalance: minBalance,
//     hideExtraLogs: true,
//     logger,
//     expectedBalance: expectedBalance || [0, 0],
//   };
//
//   let successMessage;
//
//   if (cex === 'okx' && OKX_NETWORKS.includes(network as any)) {
//     const res = await makeOkxWithdraw({
//       ...params,
//       ...baseWithdrawArgs,
//       okxWithdrawNetwork: network as OkxNetworks,
//     });
//
//     if (res.status === 'passed' || res.status === 'success') {
//       successMessage = res.message;
//     } else {
//       return res;
//     }
//   }
//
//   if (cex === 'binance' && BINANCE_NETWORKS.includes(network as any)) {
//     const res = await makeBinanceWithdraw({
//       ...params,
//       ...baseWithdrawArgs,
//       binanceWithdrawNetwork: network as BinanceNetworks,
//     });
//
//     if (res.status === 'passed' || res.status === 'success') {
//       successMessage = res.message;
//     } else {
//       return res;
//     }
//   }
//
//   if (cex === 'bitget') {
//     const res = await makeBitgetWithdraw({
//       ...params,
//       ...baseWithdrawArgs,
//       network,
//     });
//
//     if (res.status === 'passed' || res.status === 'success') {
//       successMessage = res.message;
//     } else {
//       return res;
//     }
//   }
//
//   if (successMessage) {
//     logger.success(successMessage, logTemplate);
//   }
//
//   return;
// };
//
// const AUTOGAS_SETTING_MAP: Partial<Record<SupportedNetworks, AutoGasNetworks>> = {
//   bsc: 'BSC',
//   opBNB: 'opBNB',
//   eth: 'ERC20',
//   polygon: 'Polygon',
//   arbitrum: 'Arbitrum',
//   avalanche: 'Avalanche',
//   optimism: 'Optimism',
//   zkSync: 'zkSync',
//   base: 'Base',
//   linea: 'Linea',
//   fantom: 'Fantom',
//   core: 'Core',
//   celo: 'Celo',
//   klay: 'Klayn',
//   scroll: 'Scroll',
// };
