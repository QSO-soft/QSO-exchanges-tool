import { readFileSync } from 'fs';
import { sep } from 'path';

import { OUTPUTS_JSON_FOLDER, SAVED_MODULES_FOLDER } from '../../constants';
import { LoggerType } from '../../logger';
import { Route, SavedModules, WalletData, WalletWithModules } from '../../types';
import { printResults } from '../file-handlers';
import { getFileNameWithPrefix, getSavedModulesName } from '../msg-to-template';
import { prepareSavedWalletsWithModules } from '../wallets';
import { BaseArgs, ClearAllSavedModulesByName, SaveModules, UpdateSavedModulesCount } from './types';

export const savePreparedModules = ({ routeName, walletsWithModules, projectName }: SaveModules) => {
  printResults<SavedModules>({
    data: JSON.stringify(
      {
        isFinished: false,
        route: routeName,
        walletsWithModules,
      },
      null,
      2
    ),
    fileName: getSavedModulesName(projectName, routeName),
    outputPath: SAVED_MODULES_FOLDER,
  });
};

export const clearSavedModules = (projectName: string, routeName: Route) => {
  const fileName = getSavedModulesName(projectName, routeName);

  printResults({ data: '{}', fileName, outputPath: SAVED_MODULES_FOLDER });
};

export const updateSavedModulesCount = ({
  wallet,
  moduleIndex,
  routeName,
  projectName,
  setZeroCount = false,
}: UpdateSavedModulesCount) => {
  const fileName = getSavedModulesName(projectName, routeName);

  const transformDataCallback = (data: SavedModules) => {
    const savedModules = data.walletsWithModules?.reduce<WalletWithModules[]>((acc, cur) => {
      if (cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
        const updatedModules = cur.modules.map(({ count, ...restModule }, index) => {
          const newCount = moduleIndex === index ? (setZeroCount ? 0 : count - 1) : count;

          return {
            ...restModule,
            count: newCount,
          };
        });

        const updatedWalletWithModules = {
          ...cur,
          modules: updatedModules,
        } as WalletWithModules;

        return [...acc, updatedWalletWithModules];
      }

      return [...acc, cur];
    }, []);
    return {
      ...data,
      walletsWithModules: savedModules,
    };
  };

  printResults<SavedModules>({
    data: '{}',
    fileName,
    outputPath: SAVED_MODULES_FOLDER,
    transformDataCallback,
    withAppend: true,
  });
};
export const markSavedModulesAsError = ({ wallet, moduleIndex, projectName, routeName }: UpdateSavedModulesCount) => {
  const fileName = getSavedModulesName(projectName, routeName);

  const transformDataCallback = (data: SavedModules) => {
    const savedModules = data.walletsWithModules?.reduce<WalletWithModules[]>((acc, cur) => {
      if (cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
        const updatedModules = cur.modules.map(({ ...restModule }, index) => {
          return {
            ...restModule,
            ...(moduleIndex === index && {
              isFailed: true,
            }),
          };
        });

        const updatedWalletWithModules = {
          ...cur,
          modules: updatedModules,
        } as WalletWithModules;

        return [...acc, updatedWalletWithModules];
      }

      return [...acc, cur];
    }, []);
    return {
      ...data,
      walletsWithModules: savedModules,
    };
  };

  printResults<SavedModules>({
    data: '{}',
    fileName,
    outputPath: SAVED_MODULES_FOLDER,
    transformDataCallback,
    withAppend: true,
  });
};

export const clearAllSavedModulesByName = ({
  routeName,
  wallet,
  projectName,
  moduleName,
}: ClearAllSavedModulesByName) => {
  const transformDataCallback = (data: SavedModules) => {
    const savedModules = data.walletsWithModules?.reduce<WalletWithModules[]>((acc, cur) => {
      if (cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
        const updatedModules = cur.modules.map(({ count, ...restModule }) => {
          const newCount = moduleName === restModule.moduleName ? 0 : count;

          return {
            ...restModule,
            count: newCount,
          };
        });

        const updatedWalletWithModules = {
          ...cur,
          modules: updatedModules,
        } as WalletWithModules;

        return [...acc, updatedWalletWithModules];
      }

      return [...acc, cur];
    }, []);
    return {
      ...data,
      walletsWithModules: savedModules,
    };
  };

  printResults<SavedModules>({
    data: '{}',
    fileName: getSavedModulesName(projectName, routeName),
    outputPath: SAVED_MODULES_FOLDER,
    transformDataCallback,
    withAppend: true,
  });
};

export const clearSavedWallet = (wallet: WalletData, projectName: string, routeName: string) => {
  const transformDataCallback = (data: SavedModules) => {
    const savedModules = data.walletsWithModules?.reduce<WalletWithModules[]>((acc, cur) => {
      if (cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
        return acc;
      }

      return [...acc, cur];
    }, []);
    return {
      ...data,
      walletsWithModules: savedModules,
    };
  };

  printResults<SavedModules>({
    data: '{}',
    fileName: getSavedModulesName(projectName, routeName),
    outputPath: SAVED_MODULES_FOLDER,
    transformDataCallback,
    withAppend: true,
  });
};

export const updateSavedModulesFinishStatus = ({ projectName, routeName }: BaseArgs, logger: LoggerType) => {
  const fileName = getSavedModulesName(projectName, routeName);
  const savedModules = getSavedModules(projectName, routeName);

  const walletsWithModules = prepareSavedWalletsWithModules(savedModules, logger);

  if (walletsWithModules) {
    printResults<SavedModules>({
      data: JSON.stringify(
        {
          isFinished: !walletsWithModules.length,
          walletsWithModules,
          route: savedModules.route,
        },
        null,
        2
      ),
      fileName,
      outputPath: SAVED_MODULES_FOLDER,
    });
  }
};

export const getSavedModules = (projectName: string, routeName: Route): SavedModules => {
  const fileName = getSavedModulesName(projectName, routeName);

  const filePath = `${SAVED_MODULES_FOLDER}${sep}${fileName}`;

  const savedModulesJson = readFileSync(filePath, 'utf-8');

  const savedModules = JSON.parse(savedModulesJson) as SavedModules;

  const walletsFileName = getFileNameWithPrefix(projectName, 'wallets.json');
  const walletsPath = `${OUTPUTS_JSON_FOLDER}${sep}${walletsFileName}`;
  const walletsJson = readFileSync(walletsPath, 'utf-8');
  const wallets = JSON.parse(walletsJson) as WalletData[];

  const walletsWithModules =
    savedModules.walletsWithModules?.map((walletWithModules) => {
      const walletId = walletWithModules.wallet.id;
      const walletIndex = walletWithModules.wallet.index;

      const currentWallet = wallets.find(({ id, index }) => id === walletId && index === walletIndex);
      if (currentWallet) {
        return {
          ...walletWithModules,
          wallet: {
            ...walletWithModules.wallet,
            ...currentWallet,
          },
        };
      }

      return walletWithModules;
    }) || [];

  return {
    ...savedModules,
    walletsWithModules,
  };
};
