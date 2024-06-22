import { DataSource } from 'typeorm';

import { CryptoCompareResult } from '../../helpers';
import { NumberRange, Route, SupportedNetworks, WalletWithModules } from '../../types';

export interface IModuleManager {
  walletWithModules: WalletWithModules;
  walletsTotalCount: number;
  projectName: string;
  baseNetwork: SupportedNetworks;
  dbSource: DataSource;
}
export interface StartModule {
  routeName: Route;
  logsFolderName: string;

  currentWalletIndex: number;
  nativePrices: CryptoCompareResult;

  delayBetweenWallets?: NumberRange;
}
