import {
  DefaultModuleConfigs,
  ModuleNames,
  NumberRange,
  Route,
  RouteSettings,
  TransformedModuleConfig,
  WalletData,
  WalletWithModules,
} from '../../types';

export interface BaseArgs {
  projectName: string;
  routeName: Route;
}

export type SaveModules = BaseArgs & {
  modulesData: (WalletWithModules | TransformedModuleConfig)[];
};

export type PrepareModulesArgs = {
  routeSettings: RouteSettings;
  delayBetweenTransactions: NumberRange;
  shouldShuffleModules: boolean;
  defaultModuleConfigs: DefaultModuleConfigs;
};

export interface ClearAllSavedModulesByName extends BaseArgs {
  wallet: WalletData;
  moduleName: ModuleNames;
}

export type GetUpdatedModulesCallback = (module: TransformedModuleConfig) => TransformedModuleConfig[] | void;
export type GetUpdatedModulesCallbackProp = {
  getUpdatedModulesCallback: GetUpdatedModulesCallback;
};

export interface UpdateSavedModulesCount extends BaseArgs {
  wallet?: WalletData;
  moduleIndex: number;
  setZeroCount?: boolean;
}
