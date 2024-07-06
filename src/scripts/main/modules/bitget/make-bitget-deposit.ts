import { Hex } from 'viem';

import { BITGET_ADDRESS_EMPTY_ERROR, WALLETS_REQUIRED } from '../../../../constants';
import {
  getGasOptions,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Bitget } from '../../../../managers/bitget';
import { TransformedModuleParams } from '../../../../types';

export const execMakeBitgetDeposit = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make deposit to Bitget...',
    transactionCallback: makeBitgetDeposit,
  });

const makeBitgetDeposit = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    network,
    logger,
    minAmount,
    usePercentBalance,
    minAndMaxAmount,
    tokenToWithdraw: tokenToWithdrawProp,
    wallet,
    gasLimitRange,
    gweiRange,
    minTokenBalance,
  } = params;

  if (!wallet) {
    return {
      status: 'critical',
      message: WALLETS_REQUIRED,
    };
  }

  const toAddress = wallet.bitgetAddress as Hex | undefined;
  if (!toAddress) {
    return {
      status: 'critical',
      message: BITGET_ADDRESS_EMPTY_ERROR,
    };
  }

  const tokenToWithdraw = tokenToWithdrawProp;

  const { explorerLink } = client;

  const bitget = new Bitget({
    network,
    client,
    logger,
  });

  const gasOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient: client.publicClient,
  });
  const result = await bitget.makeDeposit({
    minAmount,
    usePercentBalance,
    minAndMaxAmount,
    toAddress,
    client,
    gasOptions,
    minTokenBalance,
    token: tokenToWithdraw,
  });

  if ('error' in result) {
    return {
      status: 'warning',
      message: result.error,
    };
  }

  let tgMessage;

  if ('tgMessage' in result) {
    tgMessage = result.tgMessage;
  }

  if ('txHash' in result) {
    return {
      status: 'success',
      txHash: result.txHash,
      explorerLink,
      tgMessage,
    };
  }

  return {
    status: 'passed',
    message: result.passedMessage,
    tgMessage,
  };
};
