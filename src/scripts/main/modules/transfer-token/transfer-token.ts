import { Hex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { EMPTY_PRIV_KEY_OR_MNEMONIC, SECOND_ADDRESS_EMPTY_ERROR, WALLETS_REQUIRED } from '../../../../constants';
import {
  calculateAmount,
  decimalToInt,
  getCurrentBalanceByContract,
  getCurrentSymbolByContract,
  getGasOptions,
  getRandomNumber,
  getTrimmedLogsAmount,
  intToDecimal,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Tokens, TransformedModuleParams } from '../../../../types';

export const makeTransferToken = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    gweiRange,
    gasLimitRange,
    minAndMaxAmount,
    usePercentBalance,
    client,
    network,
    contractAddress,
    logger,
    minTokenBalance,
    balanceToLeft,
    minAmount,
    wallet,
  } = params;

  if (!wallet) {
    return {
      status: 'critical',
      message: WALLETS_REQUIRED,
    };
  }

  const { walletClient, explorerLink, publicClient } = client;
  const { secondAddress, walletAddress } = wallet;

  if (!walletClient) {
    throw new Error(EMPTY_PRIV_KEY_OR_MNEMONIC);
  }

  if (!secondAddress) {
    return {
      status: 'critical',
      message: SECOND_ADDRESS_EMPTY_ERROR,
    };
  }

  logger.info(`Transfer tokens to secondAddress [${secondAddress}]`);

  const {
    wei: weiBalance,
    int: intBalance,
    decimals,
    isNativeContract,
  } = await getCurrentBalanceByContract({ client, contractAddress });

  const { symbol } = await getCurrentSymbolByContract({ client, contractAddress });
  const tokenSymbol = symbol as Tokens;

  if (intBalance < minTokenBalance) {
    return {
      status: 'passed',
      message: `Balance ${getTrimmedLogsAmount(
        intBalance,
        tokenSymbol
      )} in ${network} is lower than minTokenBalance ${minTokenBalance}`,
    };
  }

  let amount = calculateAmount({
    balance: weiBalance,
    minAndMaxAmount,
    usePercentBalance,
    decimals,
    isBigInt: true,
  });

  if (balanceToLeft && balanceToLeft[0] && balanceToLeft[1]) {
    const balanceToLeftInt = getRandomNumber(balanceToLeft);

    const balanceToLeftWei = intToDecimal({
      amount: balanceToLeftInt,
      decimals,
    });

    amount = weiBalance - balanceToLeftWei;

    if (intBalance - balanceToLeftInt <= 0) {
      return {
        status: 'warning',
        message: `Balance is ${getTrimmedLogsAmount(
          intBalance,
          tokenSymbol
        )}  that is lower than balance to left ${getTrimmedLogsAmount(balanceToLeftInt, tokenSymbol)}`,
      };
    }
  }

  const logCalculatedAmount = `${getTrimmedLogsAmount(
    decimalToInt({
      amount,
      decimals,
    }),
    tokenSymbol
  )}`;

  if (minAmount && amount < minAmount) {
    return {
      status: 'warning',
      message: `Calculated amount [${logCalculatedAmount}] is lower than provided minAmount [${minAmount}]`,
    };
  }

  let txHash;

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient,
  });

  const transferMsg = `Transferring [${logCalculatedAmount}] in ${network} to [${secondAddress}]...`;
  if (isNativeContract) {
    const gasPrice = await publicClient.getGasPrice();

    const { maxFeePerGas } = await publicClient.estimateFeesPerGas();
    const gasLimit = await publicClient.estimateGas({
      account: walletAddress,
      to: secondAddress as Hex,
      value: amount,
      data: '0x',
      // ...feeOptions,
    });

    let value = amount - (gasLimit * maxFeePerGas * 15n) / 10n;

    if (network === 'eth') {
      value = amount - gasLimit * maxFeePerGas;
    }
    if (network === 'optimism') {
      value = amount - gasPrice * maxFeePerGas;
    }

    if (value <= 0n) {
      value = amount;
    }

    logger.info(transferMsg);

    txHash = await walletClient.sendTransaction({
      to: secondAddress as Hex,
      value,
      data: '0x',
      ...feeOptions,
    });
  } else {
    logger.info(transferMsg);

    txHash = await walletClient.writeContract({
      address: contractAddress as Hex,
      abi: defaultTokenAbi,
      functionName: 'transfer',
      args: [secondAddress as Hex, amount],
      ...feeOptions,
    });
  }

  await client.waitTxReceipt(txHash);

  return {
    txHash,
    explorerLink,
    status: 'success',
    tgMessage: `Transferred ${logCalculatedAmount} in ${network} to ${secondAddress}...`,
  };
};

export const execMakeTransferToken = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: `Execute make transfer tokens by contract [${params.contractAddress}]...`,
    transactionCallback: makeTransferToken,
  });
