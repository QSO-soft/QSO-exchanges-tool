import { DataSource } from 'typeorm';

import settings from '../../_inputs/settings/settings';
import { NOT_SAVE_FAILED_WALLET_ERRORS, SOMETHING_WENT_WRONG, SUCCESS_MESSAGES_TO_STOP_WALLET } from '../../constants';
import {
  createRandomProxyAgent,
  getProxyAgent,
  initLocalLogger,
  msgToTemplateTransform,
  showLogPreparedModules,
  sleepByRange,
} from '../../helpers';
import {
  clearAllSavedModulesByName,
  clearSavedWallet,
  markSavedModulesAsError,
} from '../../helpers/modules/save-modules';
import { LoggerData } from '../../logger';
import {
  FindModuleReturnFc,
  ModuleNames,
  ProxyAgent,
  ProxyObject,
  SupportedNetworks,
  TransformedModuleConfig,
  TransformedModuleParams,
} from '../../types';
import { sendMsgToTG } from '../telegram';
import { getTgMessageByStatus, transformMdMessage } from '../telegram/helpers';
import { IModuleManager, StartModules, StartSingleModule } from './types';

let walletIndex: number = 1;
let successCount: number = 0;
let errorCount: number = 0;

export abstract class ModuleManager {
  private walletsTotalCount: number;
  private baseNetwork: SupportedNetworks;
  private projectName: string;
  private dbSource: DataSource;

  constructor({ walletsTotalCount, baseNetwork, projectName, dbSource }: IModuleManager) {
    this.walletsTotalCount = walletsTotalCount;
    this.projectName = projectName;
    this.baseNetwork = baseNetwork;
    this.dbSource = dbSource;
  }

  abstract findModule(_moduleName: ModuleNames): FindModuleReturnFc | undefined;

  async startSingleModule({ module, logsFolderName, nativePrices, routeName }: StartSingleModule) {
    const { moduleName } = module;

    const logger = initLocalLogger(logsFolderName, 'modules');
    logger.setLoggerMeta({ moduleName });
    const logTemplate: LoggerData = {
      action: 'startSingleModule',
    };

    let proxyObject: ProxyObject | undefined;
    let proxyAgent: ProxyAgent | undefined;

    if (settings.useProxy) {
      const proxyData = await createRandomProxyAgent(logger);

      if (!proxyData) {
        logger.error('You do not use proxy! Fill the _inputs/csv/proxies.csv file');
      } else {
        const { proxyAgent: proxyAgentData, ...proxyObjectData } = proxyData;
        proxyAgent = proxyAgentData;
        proxyObject = proxyObjectData;
      }
    }

    let errorMessage = '';

    const telegramPrefixMsg = transformMdMessage(`[${walletIndex}/${this.walletsTotalCount}]\n`);

    const markAsErrorData = {
      projectName: this.projectName,
      moduleIndex: walletIndex - 1,
      routeName,
    };

    const currentModuleRunner = this.findModule(moduleName);

    if (!currentModuleRunner) {
      logger.error(`Module [${moduleName}] not found`, logTemplate);
      return;
    }

    const moduleParams: TransformedModuleParams = {
      ...module,
      routeName,
      dbSource: this.dbSource,
      nativePrices,
      projectName: this.projectName,
      baseNetwork: this.baseNetwork,
      proxyAgent,
      proxyObject,
      logger,
      moduleIndex: walletIndex - 1,
    };

    let moduleResult: { msg: string; status: string } | null = null;

    try {
      const {
        status,
        message,
        txScanUrl,
        tgMessage,
        logTemplate: moduleLogTemplate,
      } = await currentModuleRunner(moduleParams);
      const messageToTg = tgMessage || message;

      if (status === 'success') {
        moduleResult = {
          msg: getTgMessageByStatus(
            'success',
            moduleName,
            tgMessage,
            txScanUrl
              ? {
                  url: txScanUrl,
                  msg: 'Transaction',
                }
              : undefined
          ),
          status,
        };
      }

      if (status === 'warning' || status === 'critical' || status === 'error') {
        const messageWithModuleTemplate = msgToTemplateTransform(message || SOMETHING_WENT_WRONG, {
          ...moduleLogTemplate,
        });

        if (status === 'error') {
          moduleResult = {
            msg: getTgMessageByStatus('error', moduleName, messageToTg),
            status,
          };
          throw new Error(messageWithModuleTemplate);
        }

        if (status === 'warning') {
          const errorMsg = `${messageWithModuleTemplate}${
            module.stopWalletOnError
              ? ', stop producing current WALLET, because stopWalletOnError is true for current module'
              : ''
          }`;

          moduleResult = {
            msg: getTgMessageByStatus('warning', moduleName, tgMessage || errorMsg),
            status,
          };

          logger.error(errorMsg, {
            ...logTemplate,
          });

          markSavedModulesAsError(markAsErrorData);
        }

        if (status === 'critical') {
          logger.error(`${messageWithModuleTemplate}, stop producing current MODULE`, {
            ...logTemplate,
          });

          errorMessage = message || SOMETHING_WENT_WRONG;

          await sendMsgToTG({
            message: `${telegramPrefixMsg} ${getTgMessageByStatus('critical', moduleName, messageToTg)}`,
            type: 'criticalErrors',
            logger,
          });
          moduleResult = {
            msg: getTgMessageByStatus('error', moduleName, messageToTg),
            status,
          };

          markSavedModulesAsError(markAsErrorData);
        }
      }
    } catch (e) {
      const error = e as Error;
      errorMessage = error.message;

      logger.error(`${errorMessage}, stop producing current ${moduleName} MODULE`, {
        ...logTemplate,
      });

      markSavedModulesAsError(markAsErrorData);
    } finally {
      walletIndex++;

      await sleepByRange(settings.delay.betweenModules, { ...logTemplate }, logger);
    }

    if (moduleResult) {
      const message = `\\[${moduleResult.status === 'success' ? '🟢' : '❌'}]\n${telegramPrefixMsg}${
        moduleResult + '\n'
      }`;
      await sendMsgToTG({
        message,
        logger,
      });
    }
  }

  async startModules({
    logsFolderName,
    nativePrices,
    routeName,
    walletWithModules,
    delayBetweenWallets = settings.delay.betweenWallets,
  }: StartModules) {
    const { wallet, modules } = walletWithModules;
    const walletId = wallet.id;

    const logger = initLocalLogger(logsFolderName, walletId);
    logger.setLoggerMeta({ wallet, moduleName: 'Module Manager' });
    const logTemplate: LoggerData = {
      action: 'startModules',
    };

    showLogPreparedModules(modules, logger);

    let proxyObject: ProxyObject | undefined;
    let proxyAgent: ProxyAgent | undefined;

    if (settings.useProxy) {
      const walletProxy = wallet.proxy;
      const updateProxyLink = wallet.updateProxyLink;
      const isWalletProxyExist = !!walletProxy;
      const walletProxyData = isWalletProxyExist ? await getProxyAgent(walletProxy, updateProxyLink, logger) : null;
      const proxyData = walletProxyData || (await createRandomProxyAgent(logger));

      if (!proxyData) {
        logger.error('You do not use proxy! Fill the _inputs/csv/proxies.csv file');
      } else {
        const { proxyAgent: proxyAgentData, ...proxyObjectData } = proxyData;
        proxyAgent = proxyAgentData;
        proxyObject = proxyObjectData;
      }
    }

    await sleepByRange(delayBetweenWallets, logTemplate, logger);

    let errorMessage = '';

    const telegramPrefixMsg =
      transformMdMessage(`[${walletIndex}/${this.walletsTotalCount}] [${wallet.id}]: `) +
      `[${wallet.walletAddress}](https://debank.com/profile/${wallet.walletAddress})\n`;

    if (walletIndex === +this.walletsTotalCount) {
      walletIndex = 1;
    } else {
      walletIndex++;
    }

    const modulesResult: { msg: string; moduleName: string; status: string }[] = [];

    let shouldStopReversedModule = false;
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const markAsErrorData = {
        wallet,
        projectName: this.projectName,
        moduleIndex,
        routeName,
      };

      const module = modules[moduleIndex] as TransformedModuleConfig;

      const { moduleName } = module;
      logger.setLoggerMeta({ moduleName });

      if (module.reverse && module.isReverse && shouldStopReversedModule) {
        shouldStopReversedModule = false;
        logger.warning('Stop producing current REVERSED MODULE, because of error on previous one', logTemplate);
        continue;
      }

      const currentModuleRunner = this.findModule(moduleName);

      if (!currentModuleRunner) {
        logger.error(`Module [${moduleName}] not found`, logTemplate);
        return;
      }

      const moduleParams: TransformedModuleParams = {
        ...module,
        routeName,
        dbSource: this.dbSource,
        nativePrices,
        projectName: this.projectName,
        baseNetwork: this.baseNetwork,
        proxyAgent,
        proxyObject,
        wallet,
        logger,
        moduleIndex,
      };

      const isModuleWithReverse = module.reverse && !module.isReverse;

      try {
        const {
          status,
          message,
          txScanUrl,
          tgMessage,
          logTemplate: moduleLogTemplate,
        } = await currentModuleRunner(moduleParams);
        const messageToTg = tgMessage || message;

        if (status === 'passed' && module.stopWalletOnPassed) {
          logger.success('Stop producing current PASSED WALLET, because stopWalletOnPassed is true', {
            ...logTemplate,
          });

          clearSavedWallet(wallet, this.projectName, routeName);

          break;
        }

        if (status === 'passed' && isModuleWithReverse) {
          shouldStopReversedModule = false;
        }

        if (status === 'success') {
          if (isModuleWithReverse) {
            shouldStopReversedModule = false;
          }

          modulesResult.push({
            msg: getTgMessageByStatus(
              'success',
              moduleName,
              tgMessage,
              txScanUrl
                ? {
                    url: txScanUrl,
                    msg: 'Transaction',
                  }
                : undefined
            ),
            moduleName,
            status: 'success',
          });
        }

        if (status === 'warning' || status === 'critical' || status === 'error') {
          const messageWithModuleTemplate = msgToTemplateTransform(message || SOMETHING_WENT_WRONG, {
            ...moduleLogTemplate,
          });

          if (isModuleWithReverse) {
            shouldStopReversedModule = true;
          }

          if (status === 'error') {
            modulesResult.push({
              msg: getTgMessageByStatus('error', moduleName, messageToTg),
              moduleName,
              status: 'error',
            });
            throw new Error(messageWithModuleTemplate);
          }

          if (status === 'warning') {
            const errorMsg = `${messageWithModuleTemplate}${
              module.stopWalletOnError
                ? ', stop producing current WALLET, because stopWalletOnError is true for current module'
                : ''
            }`;

            modulesResult.push({
              msg: getTgMessageByStatus('warning', moduleName, tgMessage || errorMsg),
              moduleName,
              status: 'warning',
            });

            logger.error(errorMsg, {
              ...logTemplate,
            });

            markSavedModulesAsError(markAsErrorData);

            if (module.stopWalletOnError) {
              // Stop all modules and stop wallet
              break;
            }
          }

          if (status === 'critical') {
            logger.error(`${messageWithModuleTemplate}, stop producing current WALLET`, {
              ...logTemplate,
            });

            errorMessage = message || SOMETHING_WENT_WRONG;

            await sendMsgToTG({
              message: `${telegramPrefixMsg} ${getTgMessageByStatus('critical', moduleName, messageToTg)}`,
              type: 'criticalErrors',
              logger,
            });

            modulesResult.push({
              msg: getTgMessageByStatus('error', moduleName, messageToTg),
              moduleName,
              status: 'error',
            });

            markSavedModulesAsError(markAsErrorData);

            // Stop all modules and stop wallet
            break;
          }
        }
      } catch (e) {
        const error = e as Error;
        errorMessage = error.message;

        if (isModuleWithReverse) {
          shouldStopReversedModule = true;
        }

        if (module.stopWalletOnError) {
          const errorMsg = `${errorMessage}, stop producing current WALLET${
            module.stopWalletOnError ? ', because stopWalletOnError is true for current module' : ''
          }`;

          await sendMsgToTG({
            message: `${telegramPrefixMsg} ${getTgMessageByStatus('critical', moduleName, errorMsg)}`,
            type: 'criticalErrors',
            logger,
          });

          modulesResult.push({
            msg: getTgMessageByStatus('warning', moduleName, errorMsg),
            moduleName,
            status: 'warning',
          });

          logger.error(errorMsg, {
            ...logTemplate,
          });

          markSavedModulesAsError(markAsErrorData);

          // Stop all modules and stop wallet
          break;
        }

        const isSuccessMessage = SUCCESS_MESSAGES_TO_STOP_WALLET.find((error) => errorMessage.includes(error));
        if (isSuccessMessage) {
          clearAllSavedModulesByName({
            moduleName,
            routeName,
            wallet,
            projectName: this.projectName,
          });

          // modulesResult.push(getTgMessageByStatus('success', moduleName));

          logger.success(`${errorMessage}, stop producing current WALLET`, {
            ...logTemplate,
          });

          errorMessage = '';

          // Stop all modules and stop wallet
          break;
        }

        logger.error(`${errorMessage}, stop producing current ${moduleName} MODULE`, {
          ...logTemplate,
        });

        markSavedModulesAsError(markAsErrorData);

        const shouldNotSaveFailedWallet = NOT_SAVE_FAILED_WALLET_ERRORS.find((error) => errorMessage.includes(error));
        if (!module.stopWalletOnError && shouldNotSaveFailedWallet) {
          errorMessage = '';
        }
      } finally {
        await sleepByRange(settings.delay.betweenModules, { ...logTemplate }, logger);
      }
    }
    if (errorCount + successCount >= +this.walletsTotalCount) {
      errorCount = 0;
      successCount = 0;
    }
    if (modulesResult.some(({ status }) => status === 'error' || status === 'warning' || status === 'critical')) {
      errorCount++;
    } else {
      successCount++;
    }

    if (modulesResult.length) {
      const message = `\\[🟢 ${successCount} \\| ❌ ${errorCount}\\]\n${telegramPrefixMsg}\n__**Modules:**__\n${modulesResult
        .map(({ msg }) => msg)
        .join('\n')}`;

      await sendMsgToTG({
        message,
        logger,
      });
    }

    logger.success(`There are no more modules for current wallet [${wallet.walletAddress}]. Next wallet...`, {
      ...logTemplate,
    });

    return errorMessage
      ? {
          wallet,
          errorMessage,
        }
      : { wallet };
  }
}
