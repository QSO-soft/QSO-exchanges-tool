import { StartModulesCallbackArgs, StartSingleModuleCallbackArgs } from '../../../helpers';
import { BASE_NETWORK, PROJECT_NAME } from '../constants';
import { ModuleManager } from '../managers';

export const startModulesCallback = ({ walletsTotalCount, dbSource, ...rest }: StartModulesCallbackArgs) =>
  new ModuleManager({
    walletsTotalCount,
    projectName: PROJECT_NAME,
    baseNetwork: BASE_NETWORK,
    dbSource,
  }).startModules(rest);

export const startSingleModuleCallback = ({ walletsTotalCount, dbSource, ...rest }: StartSingleModuleCallbackArgs) =>
  new ModuleManager({
    walletsTotalCount,
    projectName: PROJECT_NAME,
    baseNetwork: BASE_NETWORK,
    dbSource,
  }).startSingleModule(rest);
