import 'reflect-metadata';

import { EthClient } from '../../clients';
import { runMainScript } from '../../helpers';
import { PROJECT_NAME } from './constants';
import dbSource from './db';
import { buildLocalFolderName } from './logger';
import { getUpdatedModules, routeHandler, startModulesCallback } from './utils';

(async () => {
  const logsFolderName = buildLocalFolderName();

  await runMainScript({
    logsFolderName,
    clientToPrepareWallets: EthClient,
    routeHandler,
    startModulesCallback,
    projectName: PROJECT_NAME,
    getUpdatedModulesCallback: getUpdatedModules,
    // filterWalletsCallback: filterWallets,
    routesField: 'routes',
    dbSource,
  });
})();
