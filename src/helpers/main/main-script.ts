import { readdirSync, readFileSync } from 'fs';
import { sep } from 'path';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';

import settings from '../../_inputs/settings/settings';
import { SAVED_MODULES_FOLDER } from '../../constants';
// import { WalletsEntity } from '../../scripts/zora/db/entities';
import { NumberRange, Route, SavedModules, WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import { GetUpdatedModulesCallbackProp } from '../modules';
import {
  clearSavedModules,
  getSavedModules,
  savePreparedModules,
  updateSavedModulesFinishStatus,
} from '../modules/save-modules';
import { initLocalLogger, showLogSelectedModules } from '../show-logs';
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
    projectName,
    filterWalletsCallback,
    dbSource: dbSourceProp,
    isDbInitialised = false,
    ...restProps
  } = props;

  const dbSource = isDbInitialised ? dbSourceProp : await dbSourceProp?.initialize();
  // const repo = dbSource.getRepository(WalletsEntity);
  // await repo.clear();

  const jsonWallets = await prepareWalletsData({
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

      const walletsWithModules = await prepareWalletsWithModules({
        ...restProps,
        route,
        routeSettings,
        logger,
        jsonWallets,
        projectName,
        dbSource,
        filterWalletsCallback,
        nativePrices,
        delayBetweenTransactions: delay.betweenTransactions,
        shouldShuffleModules: shuffle.modules,
        shouldShuffleWallets: shuffle.wallets,
      });
      if (!walletsWithModules?.length) {
        logger.error('Unable to prepare wallets');
        continue;
      }

      if (useSavedModules) {
        savePreparedModules({
          walletsWithModules,
          routeName: route,
          projectName,
        });
      }

      let currentThreads = 1;
      if (threads === 'all') {
        currentThreads = walletsWithModules.length;
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

      logger.success(`Starting script in [${currentThreads}] threads`);

      const results = await startWithThreads<WalletWithModules>({
        size: currentThreads,
        array: walletsWithModules,
        callback: async (walletWithModules: WalletWithModules, _, currentWalletIndex) =>
          startModulesCallback({
            nativePrices,
            walletWithModules,
            logsFolderName,
            dbSource,
            walletsTotalCount: walletsWithModules.length,
            currentWalletIndex,
            routeName: route,
            delayBetweenWallets,
          }),
        logger,
      });

      if (useSavedModules) {
        updateSavedModulesFinishStatus({ projectName, routeName: route }, logger);
      }
      saveFailedWalletsToCSV({ results: results.flat(), logger, projectName });
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
          !!data.walletsWithModules?.filter(({ modules }) => modules.some(({ count }) => count > 0)).length;

        if (notFinished) {
          notFinishedRoutes.push(data.route);
        }
      }
    }

    for (const route of notFinishedRoutes) {
      let savedModules = getSavedModules(projectName, route);
      let walletsWithModulesToRestart = prepareSavedWalletsWithModules(savedModules, logger);

      while (walletsWithModulesToRestart?.length) {
        await restartLast({
          logsFolderName,
          routeName: route,
          dbSource,
          projectName,
          startModulesCallback,
          clientToPrepareWallets,
          isDbInitialised: true,
          savedModules,
          walletsWithModules: walletsWithModulesToRestart,
        });

        savedModules = getSavedModules(projectName, route);
        walletsWithModulesToRestart = prepareSavedWalletsWithModules(savedModules, logger);
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
