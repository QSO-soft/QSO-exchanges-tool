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

let index: number = 1;

export abstract class ModuleManager {
  private baseNetwork: SupportedNetworks;
  private projectName: string;
  private dbSource: DataSource;
  private totalCount: number;

  constructor({ totalCount, baseNetwork, projectName, dbSource }: IModuleManager) {
    this.totalCount = totalCount;
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

    const telegramPrefixMsg = transformMdMessage(`[${index}/${this.totalCount}]\n`);

    const markAsErrorData = {
      projectName: this.projectName,
      moduleIndex: index - 1,
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
      moduleIndex: index - 1,
    };

    let moduleResult;

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
        moduleResult = getTgMessageByStatus(
          'success',
          moduleName,
          tgMessage,
          txScanUrl
            ? {
                url: txScanUrl,
                msg: 'Transaction',
              }
            : undefined
        );
      }

      if (status === 'warning' || status === 'critical' || status === 'error') {
        const messageWithModuleTemplate = msgToTemplateTransform(message || SOMETHING_WENT_WRONG, {
          ...moduleLogTemplate,
        });

        if (status === 'error') {
          moduleResult = getTgMessageByStatus('error', moduleName, messageToTg);
          throw new Error(messageWithModuleTemplate);
        }

        if (status === 'warning') {
          const errorMsg = `${messageWithModuleTemplate}${
            module.stopWalletOnError
              ? ', stop producing current WALLET, because stopWalletOnError is true for current module'
              : ''
          }`;

          moduleResult = getTgMessageByStatus('warning', moduleName, tgMessage || errorMsg);

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
          });
          moduleResult = getTgMessageByStatus('error', moduleName, messageToTg);

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
      index++;

      await sleepByRange(settings.delay.betweenModules, { ...logTemplate }, logger);
    }

    await sendMsgToTG({
      message: `${telegramPrefixMsg}${moduleResult + '\n'}`,
    });
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

    const telegramPrefixMsg = transformMdMessage(
      `[${index}/${this.totalCount}] [${wallet.id}]: ${wallet.walletAddress}\n`
    );
    index++;

    const modulesResult: string[] = [];

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

          modulesResult.push(
            getTgMessageByStatus(
              'success',
              moduleName,
              tgMessage,
              txScanUrl
                ? {
                    url: txScanUrl,
                    msg: 'Transaction',
                  }
                : undefined
            )
          );
        }

        if (status === 'warning' || status === 'critical' || status === 'error') {
          const messageWithModuleTemplate = msgToTemplateTransform(message || SOMETHING_WENT_WRONG, {
            ...moduleLogTemplate,
          });

          if (isModuleWithReverse) {
            shouldStopReversedModule = true;
          }

          if (status === 'error') {
            modulesResult.push(getTgMessageByStatus('error', moduleName, messageToTg));
            throw new Error(messageWithModuleTemplate);
          }

          if (status === 'warning') {
            const errorMsg = `${messageWithModuleTemplate}${
              module.stopWalletOnError
                ? ', stop producing current WALLET, because stopWalletOnError is true for current module'
                : ''
            }`;

            modulesResult.push(getTgMessageByStatus('warning', moduleName, tgMessage || errorMsg));

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
            });
            modulesResult.push(getTgMessageByStatus('error', moduleName, messageToTg));

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
          });

          modulesResult.push(getTgMessageByStatus('warning', moduleName, errorMsg));

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

    if (modulesResult.length) {
      await sendMsgToTG({
        message: `${telegramPrefixMsg}${modulesResult.join('\n')}`,
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
