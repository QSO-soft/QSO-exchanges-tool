import { RangeByIdFilter } from '../helpers';
import { AutoGasNetworks } from '../managers/auto-gas/types';
import { MoreOrLessString, NumberRange } from './common';
import { UserModuleConfig } from './module';
import { NetworkNumbersObj, SupportedNetworks } from './networks';
import { AvailableSwapTokens, Tokens } from './tokens';

export type MaxGasSetting = NetworkNumbersObj;
export type GasMultiplierSettings = NetworkNumbersObj;

export interface SettingsDelays {
  beforeTxReceipt: NumberRange;
  betweenTransactions: NumberRange;
  betweenModules: NumberRange;
  betweenWallets: NumberRange;
  betweenCheckGas: NumberRange;
  betweenRetries: number;
  betweenRestarts: number;
}

export interface AutoGasNetworkSettings {
  useAutoGas: boolean;
  cex: 'binance' | 'okx' | 'bitget';
  minBalance: number;
  withdrawToAmount: NumberRange;
  withdrawSleep: NumberRange;
  expectedBalance?: NumberRange;
}
export type AutoGasSettings = Partial<Record<AutoGasNetworks, AutoGasNetworkSettings>>;

export interface ShuffleSettings {
  wallets: boolean;
  modules: boolean;
}

export type MinTokenBalanceSettings = Partial<Record<Tokens | AvailableSwapTokens, number>>;
export type TrimLogsAmountSettings = Partial<Record<Tokens, number>> & { default: number };

interface InvitesAmount {}

export interface FilterSettings {
  useFilter: boolean;
  usePrevData: boolean;

  hasThisMonthTx: boolean | null;
  txCount: MoreOrLessString | null;
  days: MoreOrLessString | null;
  weeks: MoreOrLessString | null;
  months: MoreOrLessString | null;
  contracts: MoreOrLessString | null;
  balanceETH: MoreOrLessString | null;
  balanceUSDC: MoreOrLessString | null;
  balanceDAI: MoreOrLessString | null;
  volume: MoreOrLessString | null;
}
interface CalculateStart {
  startAgainTime: `${number}:${number}` | '';

  finishTime: `${number}-${number}-${number} ${number}:${number}` | '';
}
export interface DefaultSettings {
  routes: Route[];

  shuffle: ShuffleSettings;
  threads: number | 'all';
  txAttempts: number;
  calculateStart: CalculateStart;
  delay: SettingsDelays;
  maxGas: MaxGasSetting;
  gasMultiplier: GasMultiplierSettings;
  gweiRange: Partial<Record<SupportedNetworks, NumberRange>>;
  invitesAmount?: InvitesAmount;
  // autoGas: AutoGasSettings;
  logsTrimNumber: TrimLogsAmountSettings;
  txAttemptsToChangeProxy: number;
  useProxy: boolean;
  useRestartInMain: boolean;
  useSavedModules: boolean;
  useRestartFromNotFinished: boolean;
  idFilter: RangeByIdFilter;
  // filters: FilterSettings;
  // minTokenBalance: MinTokenBalanceSettings;
  maxL0Fee: number;
}

// =================================================================
export type Route =
  | 'base'
  | 'flow-1'
  | 'flow-2'
  | 'flow-3'
  | 'flow-4'
  | 'one-time'
  | 'low-cost'
  | 'top-up-balance'
  | 'warm-up'
  | 'volume'
  | 'dev'
  | 'checkers'
  | 'new-accounts'
  | 'polyhedra'
  | 'alt-layer'
  | 'check-balances';

export type Settings = DefaultSettings;

export type GroupSettings = Record<number, NumberRange>;

export type RouteSettings = {
  modules: UserModuleConfig[];
  groupSettings: GroupSettings;
  countModules: NumberRange;
  limitWalletsToUse: number;
  splitModuleCount?: boolean;
};
