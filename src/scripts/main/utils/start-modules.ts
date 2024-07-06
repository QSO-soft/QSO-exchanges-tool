import { StartModulesCallbackArgs, StartSingleModuleCallbackArgs } from '../../../helpers';
import { BASE_NETWORK, PROJECT_NAME } from '../constants';
import { ModuleManager } from '../managers';

export const startModulesCallback = ({ totalCount, dbSource, ...rest }: StartModulesCallbackArgs) =>
  new ModuleManager({
    totalCount,
    projectName: PROJECT_NAME,
    baseNetwork: BASE_NETWORK,
    dbSource,
  }).startModules(rest);

export const startSingleModuleCallback = ({ totalCount, dbSource, ...rest }: StartSingleModuleCallbackArgs) =>
  new ModuleManager({
    totalCount,
    projectName: PROJECT_NAME,
    baseNetwork: BASE_NETWORK,
    dbSource,
  }).startSingleModule(rest);
