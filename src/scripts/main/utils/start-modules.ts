import { StartModulesCallbackArgs } from '../../../helpers';
import { BASE_NETWORK, PROJECT_NAME } from '../constants';
import { ModuleManager } from '../managers';

export const startModulesCallback = ({
  walletWithModules,
  walletsTotalCount,
  dbSource,
  ...rest
}: StartModulesCallbackArgs) =>
  new ModuleManager({
    walletWithModules,
    walletsTotalCount,
    projectName: PROJECT_NAME,
    baseNetwork: BASE_NETWORK,
    dbSource,
  }).startModules(rest);
