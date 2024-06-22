import { Hex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { EMPTY_PRIV_KEY, SECOND_ADDRESS_EMPTY_ERROR } from '../../../../constants';
import {
  transactionWorker,
  addNumberPercentage,
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
} from '../../../../helpers';
import { Tokens, TransformedModuleParams } from '../../../../types';

export const makeTransferToken = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    gweiRange,
    gasLimitRange,
    minAndMaxAmount,
    usePercentBalance,
    wallet,
    client,
    network,
    contractAddress,
    logger,
    minTokenBalance,
    balanceToLeft,
    minAmount,
  } = params;
  const { walletClient, explorerLink, publicClient } = client;
  const { secondAddress } = wallet;

  if (!walletClient) {
    throw new Error(EMPTY_PRIV_KEY);
  }

  if (!secondAddress) {
    return {
      status: 'error',
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

  let amount = calculateAmount({
    balance: weiBalance,
    minAndMaxAmount,
    usePercentBalance,
    decimals,
    isBigInt: true,
  });

  if (intBalance < minTokenBalance) {
    return {
      status: 'passed',
      message: `Balance ${getTrimmedLogsAmount(
        intBalance,
        tokenSymbol
      )}} in ${network} is lower than minTokenBalance ${minTokenBalance}`,
    };
  }

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

    const reversedFee = getRandomNumber([20, 25]);
    const gasLimit = await publicClient.estimateGas({
      account: wallet.walletAddress,
      to: secondAddress as Hex,
      value: amount,
      data: '0x',
      ...feeOptions,
    });

    const fee = gasPrice * gasLimit;

    const feeWithPercent = BigInt(+addNumberPercentage(Number(fee), reversedFee).toFixed(0));
    const value = amount - feeWithPercent;

    if (value <= 0n) {
      return {
        status: 'passed',
        message: `Fee of transaction [${getTrimmedLogsAmount(
          decimalToInt({
            amount: feeWithPercent,
            decimals,
          }),
          tokenSymbol
        )}] is bigger than current balance [${getTrimmedLogsAmount(intBalance, tokenSymbol)}]`,
      };
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
  };
};

export const execMakeTransferToken = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: `Execute make transfer tokens by contract [${params.contractAddress}]...`,
    transactionCallback: makeTransferToken,
  });
