import settings from '../../_inputs/settings/settings';
import { NumberRange, WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import { getSavedModules, updateSavedModulesFinishStatus } from '../modules/save-modules';
import { initLocalLogger } from '../show-logs';
import { getDateDiff } from '../utils';
import { prepareSavedWalletsWithModules, prepareWalletsData } from '../wallets';
import { startWithThreads } from './threads';
import { RestartLastArgs } from './types';

export const restartLast = async ({
  logsFolderName,
  projectName,
  routeName,
  startModulesCallback,
  clientToPrepareWallets,
  dbSource: dbSourceProp,
  isDbInitialised = false,
  savedModules: savedModulesProp,
  walletsWithModules: walletsWithModulesProp,
}: RestartLastArgs) => {
  const dbSource = isDbInitialised ? dbSourceProp : await dbSourceProp?.initialize();

  await prepareWalletsData({ projectName, logsFolderName, client: clientToPrepareWallets });

  const { threads, calculateStart } = settings;

  const savedModules = savedModulesProp || getSavedModules(projectName, routeName);

  const logger = initLocalLogger(logsFolderName, routeName);
  logger.setLoggerMeta({ moduleName: 'RestartLast' });

  // const moralis = new Moralis();
  // await moralis.init(logger);

  try {
    const walletsWithModulesToRestart = walletsWithModulesProp || prepareSavedWalletsWithModules(savedModules, logger);

    if (!walletsWithModulesToRestart || !walletsWithModulesToRestart.length) {
      logger.success('Nothing to restart');
      return;
    }

    logger.success(`Restarting ${routeName} route...`);
    logger.success(`We are starting to work on [${walletsWithModulesToRestart.length}] wallets`);

    // savePreparedModules({
    //   walletsWithModules: walletsWithModulesToRestart,
    //   route: lastRoute,
    //   projectName,
    // });

    let currentThreads = 1;
    if (threads === 'all') {
      currentThreads = walletsWithModulesToRestart.length;
    } else {
      currentThreads = threads;
    }

    let delayBetweenWallets: NumberRange | undefined;
    if (calculateStart.finishTime) {
      const dateDiff = getDateDiff(calculateStart.finishTime);

      if (dateDiff >= 0) {
        delayBetweenWallets = [0, dateDiff];
      }
    }

    logger.success(`Starting script in [${currentThreads}] threads`);

    const nativePrices = await getAllNativePrices(logger);

    const threadsResults = await startWithThreads<WalletWithModules>({
      size: currentThreads,
      array: walletsWithModulesToRestart,
      callback: async (walletWithModules: WalletWithModules, _, currentWalletIndex) =>
        startModulesCallback({
          nativePrices,
          walletWithModules,
          logsFolderName,
          walletsTotalCount: walletsWithModulesToRestart.length,
          currentWalletIndex,
          routeName,
          dbSource,
          delayBetweenWallets,
        }),
      logger,
    });

    const results = threadsResults.flat();

    updateSavedModulesFinishStatus({ projectName, routeName }, logger);
    saveFailedWalletsToCSV({ results, logger, projectName });
  } catch (error) {
    logger.error(`${error}`);
  }

  return;
};
