import { WALLETS_REQUIRED } from '../../../../constants';
import {
  transactionWorker,
  calculateAmount,
  getRandomNetwork,
  getTrimmedLogsAmount,
  TransactionCallbackParams,
  TransactionCallbackResponse,
  TransactionCallbackReturn,
  getContractData,
} from '../../../../helpers';
import { Bitget } from '../../../../managers/bitget';
import { Tokens, TransformedModuleParams } from '../../../../types';

export const execMakeBitgetWithdraw = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make withdraw from Bitget...',
    transactionCallback: makeBitgetWithdraw,
  });

export const makeBitgetWithdraw = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    minTokenBalance,
    network,
    logger,
    minAmount,
    usePercentBalance,
    minAndMaxAmount,
    tokenToWithdraw: tokenToWithdrawProp,
    randomNetworks,
    waitTime,
    wallet,
    useUsd,
    nativePrices,
  } = params;

  if (!wallet) {
    return {
      status: 'critical',
      message: WALLETS_REQUIRED,
    };
  }

  let withdrawNetwork = network;
  let currentClient = client;
  const nativeToken = currentClient.chainData.nativeCurrency.symbol as Tokens;

  let tokenToWithdraw = tokenToWithdrawProp;
  const {
    tokenContractInfo,
    isNativeToken: isNativeTokenToWithdraw,
    token,
  } = getContractData({
    nativeToken,
    network: withdrawNetwork,
    token: tokenToWithdraw,
  });
  tokenToWithdraw = token;

  if (randomNetworks?.length) {
    const res = await getRandomNetwork({
      wallet,
      randomNetworks,
      logger,
      minTokenBalance,
      useUsd,
      nativePrices,
      tokenContractInfo,
      client: currentClient,
      network: withdrawNetwork,
      token: tokenToWithdraw,
      isNativeToken: isNativeTokenToWithdraw,
    });

    if ('status' in res) {
      return res as TransactionCallbackResponse;
    }

    currentClient = res.client;
    withdrawNetwork = res.network;
    tokenToWithdraw = res.token;
  }

  const bitget = new Bitget({
    network: withdrawNetwork,
    client: currentClient,
    logger,
  });

  const balance = await bitget.getTokenBalance(tokenToWithdraw);

  const amount = calculateAmount({
    balance,
    minAndMaxAmount,
    usePercentBalance,
  });

  const logCalculatedAmount = `${getTrimmedLogsAmount(amount, tokenToWithdraw)}`;
  if (minAmount && amount < minAmount) {
    return {
      status: 'warning',
      message: `Calculated amount [${logCalculatedAmount}] is lower than provided minAmount [${minAmount}]`,
    };
  }

  const logBalance = `${getTrimmedLogsAmount(balance, tokenToWithdraw)}`;
  if (amount > balance) {
    return {
      status: 'warning',
      message: `Calculated amount [${logCalculatedAmount}] is bigger than balance ${logBalance}`,
    };
  }

  const res = await bitget.makeWithdraw({
    amount,
    minTokenBalance,
    waitSleep: [waitTime, waitTime],
    token: tokenToWithdraw,
    walletAddress: wallet.walletAddress,
  });

  if (res && 'passedMessage' in res) {
    return {
      status: 'passed',
      message: res.passedMessage,
    };
  }

  return {
    status: 'success',
    tgMessage: `${network} | Withdrawn: ${logCalculatedAmount}`,
  };
};
