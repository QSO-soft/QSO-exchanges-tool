import { defaultModuleConfigs } from '../../_inputs/settings';
import settings from '../../_inputs/settings/settings';
import { LoggerType } from '../../logger';
import { SavedModules, TransformedModuleConfig, WalletData, WalletWithModules } from '../../types';
import { GetUpdatedModulesCallbackProp, prepareModulesWithOptions } from '../modules';
import { limitArray, shuffleArray } from '../utils';
import { getRangedByIdWallets, getWalletsFromKeys } from './get-filtered-wallets';
import { PrepareWallets } from './types';

export const prepareWallets = async (params: PrepareWallets) => {
  const {
    routeSettings,
    shouldShuffleWallets,
    jsonWallets,
    projectName,
    nativePrices,
    filterWalletsCallback,
    logger,
    dbSource,
  } = params;

  const logTemplate = {
    action: 'prepareWallets',
  };

  let wallets = getWalletsFromKeys(logger, jsonWallets, projectName);

  if (shouldShuffleWallets) {
    wallets = shuffleArray<WalletData>(wallets);
  }

  const limitWalletsToUse = routeSettings.limitWalletsToUse;

  const shouldLimitWallets = limitWalletsToUse > 0;

  if (shouldLimitWallets) {
    logger.success(`Limit of [${limitWalletsToUse}] has been applied. Total wallets before limit [${wallets.length}]`, {
      ...logTemplate,
    });
    wallets = limitArray(wallets, limitWalletsToUse);
  }

  wallets = getRangedByIdWallets(wallets, settings.idFilter, logger);

  // const { useFilter } = settings.filters;

  // if (useFilter && filterWalletsCallback) {
  //   wallets = await filterWalletsCallback({ wallets, dbSource, logger, nativePrices });
  //
  //   if (shouldShuffleWallets) {
  //     wallets = shuffleArray<WalletData>(wallets);
  //   }
  // }

  return wallets;
};

export const prepareWalletsWithModules = async (
  params: PrepareWallets & GetUpdatedModulesCallbackProp
): Promise<WalletWithModules[]> => {
  const { delayBetweenTransactions, shouldShuffleModules, getUpdatedModulesCallback } = params;

  const wallets = await prepareWallets(params);

  if (!wallets?.length) {
    params.logger.error('Wallets not found');
    return [];
  }

  params.logger.success(`We are starting to work on [${wallets.length}] wallets`);

  return wallets.map((wallet) => ({
    wallet,
    modules: prepareModulesWithOptions({
      routeSettings: params.routeSettings,
      delayBetweenTransactions,
      shouldShuffleModules,
      defaultModuleConfigs,
      getUpdatedModulesCallback,
    }),
  }));
};

export const prepareSavedWalletsWithModules = (savedModules: SavedModules, logger: LoggerType) => {
  let modulesDataToUse =
    savedModules.modulesData?.reduce<(WalletWithModules | TransformedModuleConfig)[]>((acc, cur) => {
      if ('wallet' in cur) {
        const currentModules = cur.modules.filter((module) => module.count > 0);

        if (currentModules.length) {
          return [...acc, { ...cur, modules: currentModules }];
        }
      } else {
        if (cur.count > 0) {
          return [...acc, cur];
        }
      }

      return acc;
    }, []) || [];

  const wallets = modulesDataToUse.reduce<WalletData[]>((acc, cur) => {
    if ('wallet' in cur) {
      return [...acc, cur.wallet];
    }

    return acc;
  }, []);

  const rangedWallets = getRangedByIdWallets(wallets, settings.idFilter, logger);
  if (rangedWallets.length) {
    modulesDataToUse = (modulesDataToUse as WalletWithModules[]).filter(({ wallet }) =>
      rangedWallets.some(({ id, index }) => id === wallet.id && index === wallet.index)
    );
  }

  if (settings.useRestartFromNotFinished) {
    const failedModulesData = [];
    const notFinishedModulesData = [];

    for (const savedData of modulesDataToUse) {
      if ('wallet' in savedData) {
        const isEachModuleFailed = savedData.modules.every(({ isFailed }) => isFailed);

        if (isEachModuleFailed) {
          failedModulesData.push(savedData);
        } else {
          notFinishedModulesData.push(savedData);
        }
      } else {
        if (savedData.isFailed) {
          failedModulesData.push(savedData);
        } else {
          notFinishedModulesData.push(savedData);
        }
      }
    }

    return [...notFinishedModulesData, ...failedModulesData];
  }

  return modulesDataToUse;
};
