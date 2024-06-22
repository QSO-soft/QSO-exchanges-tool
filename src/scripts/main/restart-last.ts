import yargs from 'yargs';

import { EthClient } from '../../clients';
import { restartLast } from '../../helpers/main/restart-last';
import { Route } from '../../types';
import { PROJECT_NAME } from './constants';
import dbSource from './db';
import { buildLocalFolderName } from './logger';
import { startModulesCallback } from './utils';

const slicedArgv = process.argv.slice(2);
const argv = await yargs().demandCommand(2, 'Args error').parse(slicedArgv);
const [_, route] = argv._;

(async () => {
  const logsFolderName = buildLocalFolderName();

  await restartLast({
    logsFolderName,
    routeName: route as Route,
    clientToPrepareWallets: EthClient,
    startModulesCallback,
    projectName: PROJECT_NAME,
    dbSource,
  });
})();
