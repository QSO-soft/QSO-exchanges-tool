import { readdirSync, readFileSync } from 'fs';
import { sep } from 'path';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';

import { defaultModuleConfigs } from '../../_inputs/settings';
import settings from '../../_inputs/settings/settings';
import { SAVED_MODULES_FOLDER } from '../../constants';
// import { WalletsEntity } from '../../scripts/zora/db/entities';
import { NumberRange, Route, SavedModules, TransformedModuleConfig, WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import { GetUpdatedModulesCallbackProp, prepareModulesWithOptions } from '../modules';
import {
  clearSavedModules,
  getSavedModules,
  savePreparedModules,
  updateSavedModulesFinishStatus,
} from '../modules/save-modules';
import { initLocalLogger, showLogPreparedModules, showLogSelectedModules } from '../show-logs';
import { getDateDiff, sleep } from '../utils';
import { prepareSavedWalletsWithModules, prepareWalletsData, prepareWalletsWithModules } from '../wallets';
import { restartLast } from './restart-last';
import { startWithThreads } from './threads';
import { MainScriptArgs } from './types';

dayjs.extend(duration);
dayjs.extend(customParseFormat);

export const runMainScript = async (props: MainScriptArgs & GetUpdatedModulesCallbackProp) => {
  const {
    clientToPrepareWallets,
    logsFolderName,
    routesField,
    routeHandler,
    startModulesCallback,
    startSingleModuleCallback,
    projectName,
    filterWalletsCallback,
    dbSource: dbSourceProp,
    isDbInitialised = false,
    getUpdatedModulesCallback,
    ...restProps
  } = props;

  const dbSource = isDbInitialised ? dbSourceProp : await dbSourceProp?.initialize();
  // const repo = dbSource.getRepository(WalletsEntity);
  // await repo.clear();

  const useEmptyWalletsMode = settings.useEmptyWalletsMode;

  const jsonWallets = useEmptyWalletsMode
    ? []
    : await prepareWalletsData({
        logsFolderName,
        projectName,
        client: clientToPrepareWallets,
      });

  const logger = initLocalLogger(logsFolderName, 'main');
  logger.setLoggerMeta({ moduleName: 'Main' });

  // const moralis = new Moralis();
  // await moralis.init(logger);

  const { threads, calculateStart, useSavedModules, useRestartInMain, shuffle, delay } = settings;
  const { finishTime, startAgainTime } = calculateStart;

  const routes = settings[routesField as keyof typeof settings] as Route[];

  for (const route of routes) {
    const logger = initLocalLogger(logsFolderName, `${route}`);
    logger.setLoggerMeta({ moduleName: 'Main' });

    try {
      const routeSettings = routeHandler(route);

      clearSavedModules(projectName, route);
      showLogSelectedModules(routeSettings, route, logger);

      const areModulesEmpty = routeSettings.modules.length === 0;
      if (areModulesEmpty) {
        logger.error('Modules can not be empty');
        continue;
      }

      const nativePrices = await getAllNativePrices(logger);

      const basePrepareProps = {
        routeSettings,
        delayBetweenTransactions: delay.betweenTransactions,
        shouldShuffleModules: shuffle.modules,
        getUpdatedModulesCallback,
      };
      let modulesData: (WalletWithModules | TransformedModuleConfig)[];
      if (useEmptyWalletsMode) {
        modulesData = prepareModulesWithOptions({
          ...basePrepareProps,
          defaultModuleConfigs,
        });
      } else {
        modulesData = await prepareWalletsWithModules({
          ...restProps,
          ...basePrepareProps,
          route,
          logger,
          jsonWallets,
          projectName,
          dbSource,
          filterWalletsCallback,
          nativePrices,
          shouldShuffleWallets: shuffle.wallets,
        });

        if (!modulesData?.length) {
          logger.error('Unable to prepare wallets');
          continue;
        }
      }

      if (useSavedModules) {
        savePreparedModules({
          modulesData,
          routeName: route,
          projectName,
        });
      }

      let currentThreads = 1;
      if (threads === 'all') {
        currentThreads = modulesData.length;
      } else {
        currentThreads = threads;
      }

      let delayBetweenWallets: NumberRange | undefined;
      if (finishTime) {
        const dateDiff = getDateDiff(finishTime);

        if (dateDiff >= 0) {
          delayBetweenWallets = [0, dateDiff];
        }
      }

      const baseStartModulesArgs = {
        nativePrices,
        logsFolderName,
        routeName: route,
        dbSource,
      };
      if (useEmptyWalletsMode) {
        logger.success('Starting script in empty wallets mode');

        showLogPreparedModules(modulesData as TransformedModuleConfig[], logger);

        await startWithThreads<TransformedModuleConfig>({
          size: 1,
          array: modulesData as TransformedModuleConfig[],
          callback: async (module: TransformedModuleConfig, _, currentIndex) =>
            startSingleModuleCallback({
              ...baseStartModulesArgs,
              module,
              currentIndex,
              walletsTotalCount: modulesData.length,
            }),
          logger,
        });
      } else {
        logger.success(`Starting script in [${currentThreads}] threads`);

        const results = await startWithThreads<WalletWithModules>({
          size: currentThreads,
          array: modulesData as WalletWithModules[],
          callback: async (walletWithModules: WalletWithModules, _, currentIndex) =>
            startModulesCallback({
              ...baseStartModulesArgs,
              walletWithModules,
              walletsTotalCount: modulesData.length,
              currentIndex,
              delayBetweenWallets,
            }),
          logger,
        });

        saveFailedWalletsToCSV({ results: results.flat(), logger, projectName });
      }

      if (useSavedModules) {
        updateSavedModulesFinishStatus({ projectName, routeName: route }, logger);
      }
    } catch (error) {
      logger.error(`${error}`);
      continue;
    }
  }

  if (useRestartInMain) {
    const savedFiles = readdirSync(SAVED_MODULES_FOLDER);

    const notFinishedRoutes: Route[] = [];
    for (const fileName of savedFiles) {
      if (!fileName.includes(projectName)) {
        continue;
      }

      const fileString = readFileSync(`${SAVED_MODULES_FOLDER}${sep}${fileName}`, 'utf-8');
      const data = JSON.parse(fileString) as SavedModules;

      if (data?.route) {
        const notFinished =
          !data.isFinished &&
          data.modulesData &&
          ('wallet' in data.modulesData
            ? !!(data.modulesData as WalletWithModules[]).filter(({ modules }) =>
                modules.some(({ count }) => count > 0)
              ).length
            : !!(data.modulesData as TransformedModuleConfig[]).filter(({ count }) => count > 0));

        if (notFinished) {
          notFinishedRoutes.push(data.route);
        }
      }
    }

    for (const route of notFinishedRoutes) {
      let savedModules = getSavedModules(projectName, route);
      let modulesDataToRestart = prepareSavedWalletsWithModules(savedModules, logger);

      while (modulesDataToRestart?.length) {
        await restartLast({
          logsFolderName,
          routeName: route,
          dbSource,
          projectName,
          startModulesCallback,
          startSingleModuleCallback,
          clientToPrepareWallets,
          isDbInitialised: true,
          savedModules,
          modulesData: modulesDataToRestart,
        });

        savedModules = getSavedModules(projectName, route);
        modulesDataToRestart = prepareSavedWalletsWithModules(savedModules, logger);
      }
    }
  }

  const restartMainProps = {
    ...props,
    dbSource,
    isDbInitialised: true,
  };

  if (startAgainTime) {
    const [hours = 0, minutes = 0] = startAgainTime.split(':').map(Number);

    const currentDate = dayjs();

    const nextDay = currentDate.add(1, 'day');

    const nextDayWithTime = nextDay.set('hour', hours).set('minute', minutes).set('second', 0);

    const secondsDifference = nextDayWithTime.diff(currentDate, 'seconds');

    logger.info(`Script will be started on ${nextDayWithTime.format('DD-MM-YYYY HH:mm')}`);

    await sleep(secondsDifference);
    await runMainScript(restartMainProps);
  }

  const delayBetweenRestarts = delay.betweenRestarts;
  if (delayBetweenRestarts > 0) {
    const secondsFromHours = dayjs.duration(delayBetweenRestarts, 'hour').asSeconds();

    await sleep(secondsFromHours, {}, logger, `Fell asleep for ${delayBetweenRestarts}h before script restarts`);
    await runMainScript(restartMainProps);
  }

  return;
};
