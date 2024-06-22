import crypto from 'crypto';

import axios from 'axios';

import { BINANCE } from '../../../../_inputs/settings';
import { UNABLE_GET_WITHDRAW_FEE_ERROR, WAIT_TOKENS } from '../../../../constants';
import { BINANCE_API_URL, BINANCE_PUBLIC_API_URL } from '../../../../constants/urls';
import {
  GetTopUpOptionsResult,
  addNumberPercentage,
  getAxiosConfig,
  getClientByNetwork,
  getExpectedBalance,
  getLogMsgWalletToppedUp,
  getProxyAgent,
  getRandomNetwork,
  getTopUpOptions,
  getTrimmedLogsAmount,
  showLogMakeWithdraw,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackResponse,
  TransactionCallbackReturn,
  transactionWorker,
  getContractData,
  getLogMsgWalletToppedUpTg,
} from '../../../../helpers';
import { LoggerData } from '../../../../logger';
import { BinanceNetworks, BinanceTokenData, ProxyAgent, Tokens, TransformedModuleParams } from '../../../../types';
import { BINANCE_NETWORK_MAP } from './constants';

interface MakeBinanceWithdraw {
  preparedTopUpOptions?: GetTopUpOptionsResult;
  hideExtraLogs?: boolean;
  withMinAmountError?: boolean;
}
export const makeBinanceWithdraw = async (
  props: TransactionCallbackParams & MakeBinanceWithdraw
): TransactionCallbackReturn => {
  const logTemplate: LoggerData = {
    action: 'execWithdraw',
  };

  const {
    binanceWithdrawNetwork: binanceWithdrawNetworkProp,
    wallet,
    expectedBalance,
    logger,
    minTokenBalance,
    minAndMaxAmount,
    tokenToWithdraw: tokenToWithdrawProp,
    minAmount,
    amount,
    waitTime,
    nativePrices,
    hideExtraLogs = false,
    useUsd = false,
    preparedTopUpOptions,
    withdrawAdditionalPercent,
    withMinAmountError,
    randomBinanceWithdrawNetworks,
  } = props;

  let binanceProxyAgent;
  if (BINANCE.proxy) {
    binanceProxyAgent = await getProxyAgent(BINANCE.proxy, wallet.updateProxyLink, logger);
  }

  let binanceWithdrawNetwork = binanceWithdrawNetworkProp;
  let client = getClientByNetwork(binanceWithdrawNetwork, logger, wallet);
  const nativeToken = client.chainData.nativeCurrency.symbol as Tokens;

  let {
    tokenContractInfo,
    isNativeToken: isNativeTokenToWithdraw,
    token: tokenToWithdraw,
  } = getContractData({
    nativeToken,
    network: binanceWithdrawNetwork,
    token: tokenToWithdrawProp,
  });

  if (randomBinanceWithdrawNetworks?.length) {
    const res = await getRandomNetwork({
      wallet,
      randomNetworks: randomBinanceWithdrawNetworks,
      logger,
      minTokenBalance,
      useUsd,
      nativePrices,
      client,
      tokenContractInfo,
      network: binanceWithdrawNetwork,
      token: tokenToWithdraw,
      isNativeToken: isNativeTokenToWithdraw,
    });

    if ('status' in res) {
      return res as TransactionCallbackResponse;
    }

    client = res.client;
    binanceWithdrawNetwork = res.network as BinanceNetworks;
    tokenContractInfo = res.tokenContractInfo;
    isNativeTokenToWithdraw = res.isNativeToken;
    tokenToWithdraw = res.token;
  }

  const walletAddress = wallet.walletAddress;

  const { currentExpectedBalance, isTopUpByExpectedBalance } = getExpectedBalance(expectedBalance);

  const fee = await getFee(binanceWithdrawNetwork, tokenToWithdraw, binanceProxyAgent?.proxyAgent);
  if (!fee) {
    return {
      status: 'error',
      message: `${UNABLE_GET_WITHDRAW_FEE_ERROR}: network=${binanceWithdrawNetwork}, token=${tokenToWithdraw}`,
    };
  }

  const topUpOptions =
    preparedTopUpOptions ||
    (await getTopUpOptions({
      client,
      wallet,
      logger,
      nativePrices,
      currentExpectedBalance,
      isTopUpByExpectedBalance,
      minTokenBalance,
      minAndMaxAmount,
      isNativeTokenToWithdraw,
      tokenContractInfo,
      tokenToWithdraw,
      amount,
      fee,
      network: binanceWithdrawNetwork,
      useUsd,
      minAmount,
      withMinAmountError,
    }));

  const isDone = 'isDone' in topUpOptions;
  if (isDone) {
    return {
      status: 'passed',
      message: topUpOptions.successMessage,
    };
  }

  const { currentAmount, currentMinAmount, shouldTopUp, prevTokenBalance } = topUpOptions;

  if (currentAmount && currentAmount < (currentMinAmount || 0)) {
    return {
      status: 'warning',
      message: `Amount [${getTrimmedLogsAmount(currentAmount, tokenToWithdraw)}] is lower than minAmount [${
        currentMinAmount || 0
      }]. Increase your minAndMaxAmount or expectedBalance`,
    };
  }

  if (shouldTopUp) {
    const amount = +(
      withdrawAdditionalPercent ? addNumberPercentage(currentAmount, withdrawAdditionalPercent) : currentAmount
    ).toFixed(8);

    const correctNetwork = NETWORK_MAP[binanceWithdrawNetwork] || binanceWithdrawNetwork;
    const currentDate = Date.now();
    const queryString = `timestamp=${currentDate}&coin=${tokenToWithdraw}&network=${correctNetwork}&address=${walletAddress}&amount=${amount}`;
    const signature = crypto.createHmac('sha256', BINANCE.secretKeys.secret).update(queryString).digest('hex');
    const queryParams = `?${queryString}&signature=${signature}`;

    const config = await getAxiosConfig({
      proxyAgent: binanceProxyAgent?.proxyAgent,
      headers: {
        'X-MBX-APIKEY': BINANCE.secretKeys.apiKey,
      },
    });

    showLogMakeWithdraw({
      logger,
      token: tokenToWithdraw,
      amount,
      network: binanceWithdrawNetwork,
      cex: 'Binance',
    });

    const { data } = await axios.post(
      `${BINANCE_API_URL}/capital/withdraw/apply${queryParams}`,
      {
        coin: tokenToWithdraw,
        network: correctNetwork,
        address: walletAddress,
        amount,
      },
      config
    );

    logger.success(
      `[${getTrimmedLogsAmount(
        amount,
        tokenToWithdraw
      )}] were send. We are waiting for the withdrawal from Binance, relax...`,
      {
        ...logTemplate,
      }
    );

    let currentBalance = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

    while (!(currentBalance.int > prevTokenBalance)) {
      const currentSleep = waitTime || 20;
      await sleep(currentSleep);

      currentBalance = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

      if (!hideExtraLogs) {
        logger.info(WAIT_TOKENS, logTemplate);
      }
    }

    if (data.id) {
      return {
        status: 'success',
        message: getLogMsgWalletToppedUp({
          cex: 'Binance',
          balance: currentBalance.int,
          token: tokenToWithdraw,
        }),
        tgMessage: getLogMsgWalletToppedUpTg({
          amount,
          balance: currentBalance.int,
          token: tokenToWithdraw,
        }),
      };
    }
  }

  return {
    status: 'error',
  };
};

const getFee = async (withdrawNetwork: BinanceNetworks, withDrawToken: Tokens, proxyAgent?: ProxyAgent) => {
  const config = await getAxiosConfig({
    proxyAgent,
  });

  const { data: feesData } = await axios.get(`${BINANCE_PUBLIC_API_URL}/capital/getNetworkCoinAll`, config);
  const data: BinanceTokenData[] = feesData?.data;
  const currentTokenData = data?.find(({ coin }) => coin === withDrawToken);
  if (!currentTokenData) {
    return;
  }

  const currentNetwork = currentTokenData.networkList.find(
    ({ network }) => network === BINANCE_NETWORK_MAP[withdrawNetwork]
  );
  if (!currentNetwork) {
    return;
  }

  return +currentNetwork.withdrawFee;
};

const NETWORK_MAP: Partial<Record<BinanceNetworks, string>> = {
  zkSync: 'zkSyncEra',
  polygon: 'matic',
  avalanche: 'AVAXC',
};

export const execBinanceWithdraw = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Binance withdraw...',
    transactionCallback: makeBinanceWithdraw,
  });
