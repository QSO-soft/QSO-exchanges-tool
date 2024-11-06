import settings from '../../_inputs/settings/settings';
import { NumberRange, TransformedModuleConfig, WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import { getSavedModules, savePreparedModules, updateSavedModulesFinishStatus } from '../modules/save-modules';
import { initLocalLogger, showLogPreparedModules } from '../show-logs';
import { getDateDiff } from '../utils';
import { prepareSavedWalletsWithModules, prepareWalletsData } from '../wallets';
import { startWithThreads } from './threads';
import { RestartLastArgs } from './types';

export const restartLast = async ({
  logsFolderName,
  projectName,
  routeName,
  startModulesCallback,
  startSingleModuleCallback,
  clientToPrepareWallets,
  dbSource: dbSourceProp,
  isDbInitialised = false,
  savedModules: savedModulesProp,
  modulesData: modulesDataProp,
}: RestartLastArgs) => {
  const dbSource = isDbInitialised ? dbSourceProp : await dbSourceProp?.initialize();

  const { threads, calculateStart } = settings;

  const savedModules = savedModulesProp || getSavedModules(projectName, routeName);

  const logger = initLocalLogger(logsFolderName, routeName);
  logger.setLoggerMeta({ moduleName: 'RestartLast' });

  // const moralis = new Moralis();
  // await moralis.init(logger);

  const modulesDataToRestart = modulesDataProp || prepareSavedWalletsWithModules(savedModules, logger);

  if (!modulesDataToRestart || !modulesDataToRestart.length) {
    logger.success('Nothing to restart');
    return;
  }

  const isEmptyWalletsMode = !('wallet' in modulesDataToRestart[0]!);

  if (!isEmptyWalletsMode) {
    await prepareWalletsData({ projectName, logsFolderName, client: clientToPrepareWallets });
  }

  try {
    logger.success(`Restarting ${routeName} route...`);
    logger.success(
      `We are starting to work on [${modulesDataToRestart.length}] ${isEmptyWalletsMode ? 'modules' : 'wallets'}`
    );

    savePreparedModules({
      modulesData: modulesDataToRestart,
      routeName,
      projectName,
    });

    let currentThreads = 1;
    if (threads === 'all') {
      currentThreads = modulesDataToRestart.length;
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

    const nativePrices = await getAllNativePrices(logger);

    const baseStartModulesArgs = {
      nativePrices,
      logsFolderName,
      routeName,
      dbSource,
    };

    if (isEmptyWalletsMode) {
      logger.success('Starting script in empty wallets mode');

      showLogPreparedModules(modulesDataToRestart as TransformedModuleConfig[], logger);

      await startWithThreads<TransformedModuleConfig>({
        size: 1,
        array: modulesDataToRestart as TransformedModuleConfig[],
        callback: async (module: TransformedModuleConfig, _, currentIndex) =>
          startSingleModuleCallback({
            ...baseStartModulesArgs,
            module,
            currentIndex,
            walletsTotalCount: modulesDataToRestart.length,
          }),
        logger,
      });
    } else {
      logger.success(`Starting script in [${currentThreads}] threads`);

      const threadsResults = await startWithThreads<WalletWithModules>({
        size: currentThreads,
        array: modulesDataToRestart as WalletWithModules[],
        callback: async (walletWithModules: WalletWithModules, _, currentIndex) =>
          startModulesCallback({
            ...baseStartModulesArgs,
            walletWithModules,
            walletsTotalCount: modulesDataToRestart.length,
            currentIndex,
            delayBetweenWallets,
          }),
        logger,
      });

      const results = threadsResults.flat();

      saveFailedWalletsToCSV({ results, logger, projectName });
    }

    updateSavedModulesFinishStatus({ projectName, routeName }, logger);
  } catch (error) {
    logger.error(`${error}`);
  }

  return;
};
