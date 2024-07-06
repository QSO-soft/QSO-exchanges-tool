import { AxiosError } from 'axios';
import { TransactionExecutionError } from 'viem';

import settings from '../../_inputs/settings/settings';
import {
  CRITICAL_ERRORS_MAP,
  NFT_HOLDING_ERROR,
  NOT_ENOUGH_FUNDS_FOR_FEE_ERROR,
  PASSED_ERROR_MAP,
  SUCCESS_MESSAGES_TO_STOP_WALLET,
  WARNING_ERRORS_MAP,
} from '../../constants';
import { LoggerData } from '../../logger';
import { MaxGas, ModuleNames, NumberRange, WorkerResponse } from '../../types';
import { getClientByNetwork } from '../clients';
import { waitGas, waitGasMultiple } from '../gas';
import { updateSavedModulesCount } from '../modules/save-modules';
import { checkMultipleOf, createRandomProxyAgent, getRandomNumber, sleep, sleepByRange } from '../utils';
import { TransactionWorkerPropsWithCallback } from './types';

const DEFAULT_ERROR_MSG = 'Execution was not done successfully';

export const transactionWorker = async (props: TransactionWorkerPropsWithCallback): Promise<WorkerResponse> => {
  const {
    startLogMessage = 'Processing transaction',
    wallet,
    logger,
    baseNetwork,
    count: countTxRange,
    delay,
    transactionCallback,
    projectName,
    routeName,
    moduleIndex,
    proxyAgent,
    proxyObject,
    nativePrices,
    dbSource,
    isInnerWorker = false,
  } = props;

  if (countTxRange > 1) {
    logger.success(`Total number of transactions for [${logger.meta.moduleName}] module: [${countTxRange}]`, {
      action: 'transactionWorker',
    });
  }

  const transactionsDelayRange = delay || settings.delay.betweenTransactions;

  let currentProxyAgent = proxyAgent;
  let currentProxyObject = proxyObject;

  const currentNetwork = props.network ? props.network : baseNetwork;

  const client = getClientByNetwork(currentNetwork, props.logger, wallet);

  let workerResponse: WorkerResponse = {
    status: 'success',
    logTemplate: {},
  };

  for (let txIndex = 0; txIndex < countTxRange; txIndex++) {
    let attempts = settings.txAttempts;

    const logTemplate: LoggerData = {
      txId: txIndex + 1,
      action: 'transactionWorker',
    };

    workerResponse = {
      ...workerResponse,
      logTemplate,
    };

    while (attempts > 0) {
      try {
        logger.info(startLogMessage, logTemplate);

        const waitGasOptions = {
          logger,
          wallet,
          sleepSeconds: getRandomNumber(settings.delay.betweenCheckGas, true),
        };
        if (props.maxGas) {
          await waitGas({
            maxGas: props.maxGas,
            ...waitGasOptions,
          });
        }

        const maxGasArray = Object.entries(settings.maxGas) as MaxGas[];
        if (maxGasArray.length && !props.maxGas) {
          await waitGasMultiple({
            maxGas: maxGasArray,
            ...waitGasOptions,
          });
        }

        // TODO: move it to constants later
        const modulesWithoutAutogas: ModuleNames[] = [
          'binance-withdraw',
          'okx-withdraw',
          'okx-collect',
          'bitget-collect',
          'bitget-withdraw',
          'bitget-wait-balance',
        ];
        const moduleName = props.moduleName;

        const params = {
          ...props,
          network: currentNetwork,
          proxyAgent: currentProxyAgent,
          proxyObject: currentProxyObject,
          client,
        };

        let response;
        // const shouldRunAutoGas = !modulesWithoutAutogas.includes(moduleName);
        // if (shouldRunAutoGas) {
        //   const autoGasRes = await runAutoGas(params);
        //   if (autoGasRes) {
        //     response = autoGasRes;
        //   }
        // }

        if (!response) {
          response = await transactionCallback(params);
        }

        workerResponse = {
          ...workerResponse,
          status: response.status,
          tgMessage: response.tgMessage,
        };

        if (response.status === 'success' || response.status === 'passed') {
          const logMessage = response.message || 'Execution was done successfully';

          if (response.txHash && response.explorerLink) {
            const txScanUrl = `${response.explorerLink}/tx/${response.txHash}`;
            workerResponse = {
              ...workerResponse,
              txScanUrl,
            };
            logger.success(`Check your transaction - ${txScanUrl}`, logTemplate);
          } else {
            logger.success(logMessage, logTemplate);
          }

          if (!props.skipClearInSaved && !isInnerWorker) {
            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
              routeName,
            });
          }
        }

        if (response.status === 'warning' || response.status === 'critical') {
          if (!isInnerWorker && response.status === 'warning' && !props.stopWalletOnError && !props.skipClearInSaved) {
            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
              routeName,
              setZeroCount: true,
            });
          }

          return {
            ...workerResponse,
            message: response.message || DEFAULT_ERROR_MSG,
          };
        }

        if (response.status === 'error') {
          throw new Error(response.message || DEFAULT_ERROR_MSG);
        }

        if (txIndex !== countTxRange) {
          await sleepByRange(transactionsDelayRange as NumberRange, logTemplate, logger);
        }

        break;
      } catch (e) {
        const error = e as Error;
        let errorMessage: string = error.message;

        if (e instanceof AxiosError) {
          errorMessage =
            e.response?.data.msg ||
            e.response?.data.message ||
            e.response?.data.error ||
            e.response?.data.error?.message ||
            e.response?.data.error?.msg ||
            e.response?.data.errors?.[0]?.message ||
            e.response?.data.errors?.[0]?.msg ||
            errorMessage;
        }

        if (e instanceof TransactionExecutionError) {
          if (errorMessage.includes('gas required exceeds allowance')) {
            errorMessage = NOT_ENOUGH_FUNDS_FOR_FEE_ERROR;
          } else {
            errorMessage = `Unable to execute transaction. ${e.shortMessage}`;
          }
        }

        if (errorMessage.includes('Details: {')) {
          errorMessage = errorMessage.split('"message":"')[1]?.split('"')[0] || errorMessage;
        }
        const successMessage = SUCCESS_MESSAGES_TO_STOP_WALLET.find((error) => errorMessage.includes(error));

        const isNftHoldingError = errorMessage.includes(NFT_HOLDING_ERROR);

        if (errorMessage.includes('max fee per gas less than block base fee')) {
          errorMessage = `Please, increase gasMultiplier setting for ${currentNetwork} network. Fee of this network is higher, than provided`;
        }

        if (errorMessage.includes('An unknown RPC error occured')) {
          errorMessage = `An unknown RPC error occured in ${currentNetwork} network`;
        }

        if (errorMessage.includes('execution reverted') && !isNftHoldingError) {
          errorMessage = 'Unable to execute transaction for unknown reason';
        }

        if (successMessage) {
          throw new Error(errorMessage);
        }

        for (const [originalMessage, customMessage] of Object.entries(CRITICAL_ERRORS_MAP)) {
          if (errorMessage.includes(originalMessage)) {
            return {
              ...workerResponse,
              status: 'critical',
              message: customMessage,
            };
          }
        }

        attempts--;

        for (const [originalMessage, customMessage] of Object.entries(WARNING_ERRORS_MAP)) {
          if (errorMessage.includes(originalMessage)) {
            if (!isInnerWorker && !props.stopWalletOnError && !props.skipClearInSaved) {
              updateSavedModulesCount({
                wallet,
                moduleIndex,
                projectName,
                routeName,
                setZeroCount: true,
              });
            }

            return {
              ...workerResponse,
              status: 'warning',
              message: customMessage,
            };
          }
        }

        for (const [originalMessage, customMessage] of Object.entries(PASSED_ERROR_MAP)) {
          if (!isInnerWorker && errorMessage.includes(originalMessage) && !props.skipClearInSaved) {
            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
              routeName,
              setZeroCount: true,
            });

            logger.success(customMessage, {
              ...logTemplate,
            });

            return {
              ...workerResponse,
              status: 'passed',
            };
          }
        }

        if (attempts > 0 && !isInnerWorker) {
          logger.warning(`${errorMessage}. ${attempts} attempts left`, logTemplate);

          await sleep(settings.delay.betweenRetries, logTemplate, logger);

          const attemptsToChangeProxy = settings.txAttemptsToChangeProxy;
          const currentRetryCount = settings.txAttempts - attempts;

          const shouldUpdateProxy = checkMultipleOf(attemptsToChangeProxy, currentRetryCount);

          if (settings.useProxy && shouldUpdateProxy) {
            const newProxyData = await createRandomProxyAgent(logger);

            if (newProxyData) {
              const { proxyAgent: newProxyAgent, ...newProxyObject } = newProxyData;

              currentProxyAgent = newProxyAgent || proxyAgent;
              currentProxyObject = newProxyObject || proxyObject;
            }
          }
        } else {
          if (!isInnerWorker) {
            logger.warning(`The attempts are over. ${attempts} attempts left`, logTemplate);
          }

          return {
            ...workerResponse,
            status: 'error',
            message: errorMessage,
          };
        }
      }
    }
  }

  return workerResponse;
};
