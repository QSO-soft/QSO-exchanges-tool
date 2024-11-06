import { DataSource } from 'typeorm';

import { CryptoCompareResult } from '../../helpers';
import { NumberRange, Route, SupportedNetworks, TransformedModuleConfig, WalletWithModules } from '../../types';

export interface IModuleManager {
  walletsTotalCount: number;
  projectName: string;
  baseNetwork: SupportedNetworks;
  dbSource: DataSource;
}

export interface StartModulesBase {
  routeName: Route;
  logsFolderName: string;

  currentIndex: number;
  nativePrices: CryptoCompareResult;
}
export interface StartSingleModule extends StartModulesBase {
  module: TransformedModuleConfig;
}
export interface StartModules extends StartModulesBase {
  walletWithModules: WalletWithModules;
  delayBetweenWallets?: NumberRange;
}
