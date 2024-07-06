import { readFileSync } from 'fs';
import { sep } from 'path';

import { OUTPUTS_JSON_FOLDER, SAVED_MODULES_FOLDER } from '../../constants';
import { LoggerType } from '../../logger';
import { Route, SavedModules, TransformedModuleConfig, WalletData, WalletWithModules } from '../../types';
import { printResults } from '../file-handlers';
import { getFileNameWithPrefix, getSavedModulesName } from '../msg-to-template';
import { prepareSavedWalletsWithModules } from '../wallets';
import { BaseArgs, ClearAllSavedModulesByName, SaveModules, UpdateSavedModulesCount } from './types';

export const savePreparedModules = ({ routeName, modulesData, projectName }: SaveModules) => {
  printResults<SavedModules>({
    data: JSON.stringify(
      {
        isFinished: false,
        route: routeName,
        modulesData,
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
    const savedModules = data.modulesData?.reduce<(WalletWithModules | TransformedModuleConfig)[]>(
      (acc, cur, index) => {
        if ('wallet' in cur) {
          if (wallet && cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
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
        } else {
          const { count, ...restModule } = cur as TransformedModuleConfig;

          const newCount = moduleIndex === index ? (setZeroCount ? 0 : count - 1) : count;

          return [
            ...acc,
            {
              ...restModule,
              count: newCount,
            },
          ];
        }

        return [...acc, cur];
      },
      []
    );

    return {
      ...data,
      modulesData: savedModules,
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
    const savedModules = data.modulesData?.reduce<(WalletWithModules | TransformedModuleConfig)[]>(
      (acc, cur, index) => {
        if ('wallet' in cur) {
          if (wallet && cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
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
        } else {
          const { ...restModule } = cur as TransformedModuleConfig;

          return [
            ...acc,
            {
              ...restModule,
              ...(moduleIndex === index && {
                isFailed: true,
              }),
            },
          ];
        }

        return [...acc, cur];
      },
      []
    );
    return {
      ...data,
      modulesData: savedModules,
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
    const savedModules = data.modulesData?.reduce<(WalletWithModules | TransformedModuleConfig)[]>(
      (acc, cur, index) => {
        if ('wallet' in cur) {
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
        } else {
          const { count, ...restModule } = cur as TransformedModuleConfig;

          const newCount = moduleName === restModule.moduleName ? 0 : count;

          return [
            ...acc,
            {
              ...restModule,
              count: newCount,
            },
          ];
        }

        return [...acc, cur];
      },
      []
    );
    return {
      ...data,
      modulesData: savedModules,
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
    const savedModules = data.modulesData?.reduce<(WalletWithModules | TransformedModuleConfig)[]>((acc, cur) => {
      if ('wallet' in cur) {
        if (cur.wallet.id === wallet.id && cur.wallet.index === wallet.index) {
          return acc;
        }
      }

      return [...acc, cur];
    }, []);
    return {
      ...data,
      modulesData: savedModules,
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

  const modulesData = prepareSavedWalletsWithModules(savedModules, logger);

  if (modulesData) {
    printResults<SavedModules>({
      data: JSON.stringify(
        {
          isFinished: !modulesData.length,
          modulesData,
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

  const modulesData =
    savedModules.modulesData?.map((modulesData) => {
      if ('wallet' in modulesData) {
        const walletId = modulesData.wallet.id;
        const walletIndex = modulesData.wallet.index;

        const currentWallet = wallets.find(({ id, index }) => id === walletId && index === walletIndex);
        if (currentWallet) {
          return {
            ...modulesData,
            wallet: {
              ...modulesData.wallet,
              ...currentWallet,
            },
          };
        }
      }

      return modulesData;
    }) || [];

  return {
    ...savedModules,
    modulesData,
  };
};
