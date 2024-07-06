import { gate } from 'ccxt';

import { GATE } from '../../../../_inputs/settings';
import { defaultTokenAbi } from '../../../../clients/abi';
import { BASE_TIMEOUT, GATE_EMPTY_KEYS_ERROR, GATE_WL_ERROR, WALLETS_REQUIRED } from '../../../../constants';
import {
  transactionWorker,
  createProxyAgent,
  getTokenContract,
  getTopUpOptions,
  getTrimmedLogsAmount,
  prepareProxy,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackReturn,
} from '../../../../helpers';
import { ProxyAgent, Tokens, TransformedModuleParams } from '../../../../types';
import { GATE_NETWORK_MAP } from './constants';

export const execMakeGateWithdraw = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Gate withdraw...',
    transactionCallback: makeGateWithdraw,
  });

const makeGateWithdraw = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    nativePrices,
    wallet,
    network,
    logger,
    minTokenBalance,
    minAndMaxAmount,
    tokenToWithdraw,
    minAmount,
  } = params;

  if (!wallet) {
    return {
      status: 'critical',
      message: WALLETS_REQUIRED,
    };
  }

  const correctGateNetwork = GATE_NETWORK_MAP[network];
  if (!correctGateNetwork) {
    return {
      status: 'warning',
      message: `Network ${network} is not supported`,
    };
  }

  const nativeToken = client.chainData.nativeCurrency.symbol as Tokens;
  const isNativeTokenToWithdraw = tokenToWithdraw === nativeToken;

  let tokenContractInfo;
  if (!isNativeTokenToWithdraw) {
    const tokenContract = getTokenContract({
      tokenName: tokenToWithdraw,
      network,
    });

    tokenContractInfo = isNativeTokenToWithdraw
      ? undefined
      : {
          name: tokenToWithdraw,
          address: tokenContract.address,
          abi: defaultTokenAbi,
        };
  }

  const topUpOptions = await getTopUpOptions({
    client,
    wallet,
    logger,
    minTokenBalance,
    minAndMaxAmount,
    isNativeTokenToWithdraw,
    tokenContractInfo,
    tokenToWithdraw,
    minAmount,
    nativePrices,
    network,
    currentExpectedBalance: 0,
    isTopUpByExpectedBalance: false,
  });

  const isDone = 'isDone' in topUpOptions;
  if (isDone) {
    return {
      status: 'passed',
      message: topUpOptions.successMessage,
    };
  }

  const { currentAmount, currentMinAmount, shouldTopUp, prevTokenBalance } = topUpOptions;

  if (shouldTopUp) {
    try {
      if (currentMinAmount && currentAmount < currentMinAmount) {
        return {
          status: 'warning',
          message: `Calculated amount [${getTrimmedLogsAmount(
            currentAmount,
            tokenToWithdraw
          )}] is lower than minAMount ${currentMinAmount}`,
        };
      }

      const proxy = GATE.proxy;
      let proxyAgent: ProxyAgent | null = null;
      if (proxy) {
        const proxyObject = prepareProxy({ proxy }, logger);
        proxyAgent = createProxyAgent(proxyObject?.url);
      }

      const gateController = new gate({
        ...GATE.secretKeys,
        ...(!!proxyAgent && { agent: proxyAgent }),
        timeout: BASE_TIMEOUT,
      });

      logger.info(`Withdrawing [${getTrimmedLogsAmount(currentAmount, tokenToWithdraw)}] in ${network} via Gate`);

      await gateController.withdraw(tokenToWithdraw, currentAmount, wallet.walletAddress, {
        network: correctGateNetwork,
      });

      let currentBalance = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);
      while (!(currentBalance.int > prevTokenBalance)) {
        const currentSleep = 30;
        await sleep(currentSleep);

        currentBalance = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

        logger.info('Tokens are still on the way to wallet...');
      }

      return {
        status: 'success',
        message: `Your wallet was successfully topped up from Gate. Current balance is [${getTrimmedLogsAmount(
          currentBalance.int,
          tokenToWithdraw
        )}]`,
      };
    } catch (err) {
      const errorMessage = (err as Error).message;

      if (errorMessage.includes('Request API key does not have wallet permission')) {
        throw new Error(GATE_WL_ERROR);
      }

      if (
        errorMessage.includes('gate requires "apiKey" credential') ||
        errorMessage.includes('gate requires "secret" credential')
      ) {
        throw new Error(GATE_EMPTY_KEYS_ERROR);
      }

      throw err;
    }
  }

  return {
    status: 'error',
  };
};
