import { DataSource } from 'typeorm';
import { Hex } from 'viem';

import { CryptoCompareResult, TransactionCallbackResponse } from '../helpers';
import { LoggerData, LoggerType } from '../logger';
import { Cex, NumberRange, ProxyAgent, ProxyObject, WalletData } from './common';
import { BinanceNetworks, OkxNetworks, SupportedNetworks } from './networks';
import { MinTokenBalanceSettings, Route } from './settings';
import { AvailableSwapTokens, Tokens } from './tokens';

export type WorkerResponse = Pick<TransactionCallbackResponse, 'status' | 'message' | 'tgMessage' | 'explorerLink'> & {
  logTemplate: LoggerData;
  txScanUrl?: string;
};

export type FindModuleReturnFc = (params: TransformedModuleParams) => Promise<WorkerResponse>;

export type ModuleNames =
  | 'binance-withdraw'
  | 'gate-withdraw'
  | 'okx-withdraw'
  | 'okx-collect'
  | 'transfer-token'
  | 'balance-checker'
  | 'check-native-balance'
  | 'bitget-withdraw'
  | 'bitget-deposit'
  | 'bitget-collect'
  | 'bitget-wait-balance';

export type MaxGas = [SupportedNetworks, number];
export type HexOrNative = Hex | 'native';
export type ContractPairs = [HexOrNative, HexOrNative];
export type Pairs = [AvailableSwapTokens, AvailableSwapTokens];
export type NetworksArray = [SupportedNetworks, ...SupportedNetworks[]];
export type OptionalNetworksArray = SupportedNetworks[];
export type TokensArray = [Tokens, ...Tokens[]];

export interface ExtraModuleParams {
  // General
  network?: SupportedNetworks;
  randomNetworks?: OptionalNetworksArray;
  gweiRange?: NumberRange;
  gasLimitRange?: NumberRange;
  maxGas?: MaxGas;
  useInvitesAutosave?: boolean;
  stopWalletOnError?: boolean;
  stopWalletOnPassed?: boolean;
  skipClearInSaved?: boolean;
  destinationNetwork?: SupportedNetworks;
  destinationNetworks?: NetworksArray;
  contractAddress?: HexOrNative;
  contractAddresses?: Hex[];
  projectAddresses?: Hex[];
  walletAddress?: Hex;

  useUsd?: boolean;
  // Swaps / Liquidity / Lending
  srcToken?: AvailableSwapTokens;
  destTokens?: [AvailableSwapTokens, ...AvailableSwapTokens[]];
  pairs?: Pairs;
  networkPairs?: [SupportedNetworks, SupportedNetworks];
  contractPairs?: ContractPairs;
  reverse?: boolean;
  slippage?: number;
  tokenToSupply?: Tokens;
  collateral?: 'disable' | 'enable';

  // Withdraws
  tokenToWithdraw?: Tokens;
  withdrawAdditionalPercent?: number;
  reservePercentNetworkFee?: number;

  binanceWithdrawNetwork?: BinanceNetworks;
  randomBinanceWithdrawNetworks?: BinanceNetworks[];

  okxWithdrawNetwork?: OkxNetworks;
  randomOkxWithdrawNetworks?: OkxNetworks[];
  okxWithdrawFees?: number;
  okxAccounts?: string[] | 'all';
  collectTokens?: Tokens[];
  randomTokens?: TokensArray;
  randomCex?: [Cex, ...Cex[]];

  // Amounts
  reverseMinAndMaxAmount?: NumberRange;
  minAndMaxAmount?: NumberRange;
  splitAmount?: NumberRange;
  minAmount?: number;
  amount?: number;
  usePercentBalance?: boolean;
  minTokenBalance?: number;
  minBalanceByToken?: MinTokenBalanceSettings;
  minNativeBalance?: number;
  minDestTokenBalance?: number;
  minDestNativeBalance?: number;
  balanceToLeft?: NumberRange;

  expectedBalance?: NumberRange;

  minNativeBalanceNetwork?: SupportedNetworks;

  maxTxsCount?: NumberRange;
  maxFee?: number;
  bytecode?: Hex;

  flows?: [NetworksArray, ...NetworksArray[]];

  waitTime?: number;
  waitBalance?: number;
}

export interface DefaultModuleConfig extends ExtraModuleParams {
  count: NumberRange;
  indexGroup: number;
  delay?: NumberRange;
}

export type UserModuleConfig = Partial<DefaultModuleConfig> & {
  moduleName: ModuleNames;
};
export type ModuleConfig = Required<UserModuleConfig>;

export type GroupedModules = Record<number, ModuleConfig[]>;

export type ModuleParams = ModuleConfig & ExtraModuleParams;

export type DefaultModuleConfigs = Record<ModuleNames, DefaultModuleConfig>;

export type TransformedModuleParams = Omit<ModuleParams, 'count'> & {
  moduleIndex: number;
  count: number;
  proxyAgent?: ProxyAgent;
  proxyObject?: ProxyObject;
  isReverse?: boolean;
  logger: LoggerType;
  wallet?: WalletData;

  dbSource: DataSource;
  isInnerWorker?: boolean;

  baseNetwork: SupportedNetworks;
  projectName: string;
  routeName: Route;
  nativePrices: CryptoCompareResult;
};

export type TransformedModuleConfig = Omit<ModuleConfig, 'count'> & {
  count: number;
  isReverse?: boolean;
  isFailed?: boolean;
};
