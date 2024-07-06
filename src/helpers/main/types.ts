import { DataSource } from 'typeorm';
import { Hex } from 'viem';

import {
  NumberRange,
  Route,
  RouteSettings,
  SavedModules,
  SupportedNetworks,
  TransformedModuleConfig,
  TransformedModuleParams,
  WalletWithModules,
} from '../../types';
import { ClientClass, ClientType } from '../clients';
import { CryptoCompareResult } from '../currency-handlers';
import { FilterWalletsCb } from '../wallets';

export type ResponseStatus = 'passed' | 'success' | 'warning' | 'error' | 'critical';

export type TransactionCallbackParams = TransformedModuleParams & {
  client: ClientType;
};

export type BaseTransactionWorkerProps = TransformedModuleParams & {
  startLogMessage?: string;
};
export type BaseTransactionWorkerWithCallbeckProps = BaseTransactionWorkerProps & TransactionWorkerCallbackProp;
export type TransactionWorkerProps = BaseTransactionWorkerProps & {
  baseNetwork: SupportedNetworks;
  projectName: string;
  routeName: Route;
  moduleIndex: number;
  isInnerWorker?: boolean;
};
export type TransactionCallbackResponse = {
  status: ResponseStatus;
  message?: string;
  tgMessage?: string;
  txHash?: Hex;
  explorerLink?: string;
};
export type TransactionCallbackReturn = Promise<TransactionCallbackResponse>;
export type TransactionWorkerCallbackProp = {
  transactionCallback: (params: TransactionCallbackParams) => TransactionCallbackReturn;
};
export type TransactionWorkerPropsWithCallback = TransactionWorkerCallbackProp & TransactionWorkerProps;

export type StartModulesCallbackBaseArgs = {
  nativePrices: CryptoCompareResult;
  logsFolderName: string;
  routeName: Route;
  dbSource: DataSource;
  currentIndex: number;
  totalCount: number;
};
export type StartSingleModuleCallbackArgs = StartModulesCallbackBaseArgs & {
  module: TransformedModuleConfig;
  delayBetweenWallets?: NumberRange;
};
export type StartModulesCallbackArgs = StartModulesCallbackBaseArgs & {
  walletWithModules: WalletWithModules;
  delayBetweenWallets?: NumberRange;
};

type StartModulesCallback = (args: StartModulesCallbackArgs) => Promise<any>;
type StartSingleModulesCallback = (args: StartSingleModuleCallbackArgs) => Promise<any>;

export type BaseMainScriptArgs = {
  clientToPrepareWallets: ClientClass;
  logsFolderName: string;
  startModulesCallback: StartModulesCallback;
  startSingleModuleCallback: StartSingleModulesCallback;
  projectName: string;
  dbSource: DataSource;
  isDbInitialised?: boolean;
};
export interface RestartLastArgs extends BaseMainScriptArgs {
  savedModules?: SavedModules;
  modulesData?: (WalletWithModules | TransformedModuleConfig)[];
  routeName: Route;
}

export type MainScriptArgs = BaseMainScriptArgs & {
  routeHandler: (route: Route) => RouteSettings;
  routesField: string;
  filterWalletsCallback?: FilterWalletsCb;
};
