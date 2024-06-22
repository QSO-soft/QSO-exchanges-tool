import crypto from 'crypto';

import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Hex } from 'viem';

import { BITGET } from '../../_inputs/settings';
import { defaultTokenAbi } from '../../clients/abi';
import { BITGET_KEYS_ERROR, EMPTY_PRIV_KEY, WAIT_TOKENS } from '../../constants';
import {
  calculateAmount,
  ClientType,
  createProxyAgent,
  decimalToInt,
  getAxiosConfig,
  getLogMsgWalletToppedUp,
  getQueryString,
  getRandomNumber,
  getTokenContract,
  getTrimmedLogsAmount,
  prepareProxy,
  showLogMakeWithdraw,
  sleep,
} from '../../helpers';
import type { LoggerType } from '../../logger';
import { ProxyAgent, SupportedNetworks, Tokens } from '../../types';
import { API_URL } from './constants';
import {
  BitgetConstructor,
  BitgetDeposit,
  BitgetTransferFromAccsToMain,
  BitgetWithdraw,
  GetAssets,
  MakeRequest,
  SubAccTransfer,
  Withdraw,
} from './types';

// Singleton
export class Bitget {
  private readonly logger: LoggerType;
  private readonly client?: ClientType;
  private readonly network?: SupportedNetworks;
  private proxyAgent?: ProxyAgent;
  private readonly hideExtraLogs?: boolean;

  constructor({ logger, client, network, hideExtraLogs }: BitgetConstructor) {
    this.logger = logger;
    this.client = client;
    this.network = network;
    this.hideExtraLogs = hideExtraLogs;
    if (BITGET.proxy) {
      const proxyObject = prepareProxy(BITGET.proxy, logger);
      const proxyAgent = createProxyAgent(proxyObject?.url);

      if (proxyAgent) {
        this.proxyAgent = proxyAgent;
      }
    }
  }

  public async getTokenBalance(token: Tokens) {
    const assets = await this.getAssets({
      coin: token,
    });

    return +assets[0]?.available || 0;
  }

  public async makeWithdraw({ token, amount, waitSleep, minTokenBalance, walletAddress }: BitgetWithdraw) {
    if (!this.network || !this.client) {
      throw new Error('Network was not provided');
    }

    const isNativeToken = token === this.client.chainData.nativeCurrency.symbol;
    const tokenContract = getTokenContract({
      tokenName: token,
      network: this.network,
    }).address;

    const tokenContractInfo = isNativeToken
      ? undefined
      : {
          name: token,
          address: tokenContract,
          abi: defaultTokenAbi,
        };

    const { int: prevBalance } = await this.client.getNativeOrContractBalance(isNativeToken, tokenContractInfo);

    if (minTokenBalance && prevBalance >= minTokenBalance) {
      return {
        passedMessage: `Balance is [${prevBalance} ${token}] in [${this.network}] already more than [${minTokenBalance} ${token}]`,
      };
    }

    showLogMakeWithdraw({
      logger: this.logger,
      token,
      amount,
      network: this.network,
      cex: 'Bitget',
    });

    const params: Withdraw = {
      network: this.network,
      coin: token,
      transferType: 'on_chain',
      address: walletAddress,
      size: +amount.toFixed(7),
    };

    try {
      await this.withdraw(params);

      const currentSleep = waitSleep ? getRandomNumber(waitSleep) : 60;

      await sleep(currentSleep);

      let currentBalance = await this.client.getNativeOrContractBalance(isNativeToken, tokenContractInfo);
      while (!(currentBalance.int > prevBalance)) {
        currentBalance = await this.client.getNativeOrContractBalance(isNativeToken, tokenContractInfo);

        this.logger.info(WAIT_TOKENS);

        await sleep(currentSleep);
      }

      this.logger.success(
        getLogMsgWalletToppedUp({
          cex: 'Bitget',
          balance: currentBalance.int,
          token,
        })
      );
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const code = err.response?.data?.code || err.code || 0;

        if (+code === 47003) {
          await sleep(5);

          return this.withdraw({
            ...params,
            address: walletAddress.toLowerCase(),
          });
        }
      }

      throw err;
    }
  }
  public async makeDeposit({
    token,
    minAndMaxAmount,
    minAmount,
    usePercentBalance,
    toAddress,
    client,
    gasOptions,
    minTokenBalance = 0,
  }: BitgetDeposit) {
    if (!this.network || !this.client) {
      throw new Error('Network was not provided');
    }

    const { walletClient } = client;
    if (!walletClient) {
      throw new Error(EMPTY_PRIV_KEY);
    }

    const isNativeToken = token === this.client.chainData.nativeCurrency.symbol;
    const tokenContract = getTokenContract({
      tokenName: token,
      network: this.network,
    }).address;

    const tokenContractInfo = isNativeToken
      ? undefined
      : {
          name: token,
          address: tokenContract,
          abi: defaultTokenAbi,
        };

    const balance = await this.client.getNativeOrContractBalance(isNativeToken, tokenContractInfo);

    const logBalance = `${getTrimmedLogsAmount(balance.int, token)}`;

    if (balance.int <= minTokenBalance) {
      return {
        passedMessage: `Balance [${logBalance}] in [${this.network}] network is lower than minimum [${minTokenBalance} ${token}]`,
      };
    }

    const amount = calculateAmount({
      isBigInt: true,
      balance: balance.wei,
      decimals: balance.decimals,
      minAndMaxAmount,
      usePercentBalance,
    });
    const amountInt = decimalToInt({
      amount,
      decimals: balance.decimals,
    });

    const logAmount = `${getTrimmedLogsAmount(amountInt, token)}`;

    if (minAmount && amountInt < minAmount) {
      return {
        error: `Calculated amount [${logAmount}] for [${this.network}] network is lower than provided minAmount [${minAmount}]`,
      };
    }

    if (amountInt > balance.int) {
      return {
        error: `Calculated amount [${logAmount}] is bigger than balance [${logBalance}] in [${this.network}] network`,
      };
    }

    this.logger.info(`Depositing [${logAmount}] to [${toAddress}] in [${this.network}]...`);

    const subAccountAssets = await this.getSubAccAssets();

    let prevBalances: Record<string, number> = {};
    for (const subAcc of subAccountAssets) {
      for (const asset of subAcc.assetsList) {
        if (token === asset.coin) {
          const amount = asset.available;
          const subAccUserId = subAcc.userId;

          prevBalances = {
            ...prevBalances,
            [subAccUserId]: +amount,
          };
        }
      }
    }

    let txHash;
    if (isNativeToken) {
      txHash = await walletClient.sendTransaction({
        to: toAddress,
        value: amount,
        data: '0x',
        ...gasOptions,
      });
    } else {
      txHash = await walletClient.writeContract({
        address: tokenContract,
        abi: defaultTokenAbi,
        functionName: 'transfer',
        args: [toAddress as Hex, amount],
        ...gasOptions,
      });
    }

    await client.waitTxReceipt(txHash);

    const transaction = await client.publicClient.getTransactionReceipt({ hash: txHash });

    if (transaction.status === 'success') {
      // let isBalanceIncreased = false;
      // while (!isBalanceIncreased) {
      //   this.logger.info('Waiting for receiving...');
      //
      //   const subAccountAssets = await this.getSubAccAssets();
      //
      //   let currentBalances: Record<string, number> = {};
      //   for (const subAcc of subAccountAssets) {
      //     for (const asset of subAcc.assetsList) {
      //       if (token === asset.coin) {
      //         const amount = asset.available;
      //         const subAccUserId = subAcc.userId;
      //
      //         currentBalances = {
      //           ...currentBalances,
      //           [subAccUserId]: +amount,
      //         };
      //       }
      //     }
      //   }
      //
      //   isBalanceIncreased = Object.entries(currentBalances).some(([key, value]) => value > (prevBalances[+key] || 0));
      //
      //   if (!isBalanceIncreased) {
      //     await sleep(30);
      //   }
      // }
      return { txHash, tgMessage: `${this.network} | Deposited: ${logAmount}` };
    } else {
      throw new Error(`Transaction ${txHash} was rejected`);
    }
  }

  public async makeTransferFromSubsToMain({ tokens }: BitgetTransferFromAccsToMain) {
    const accountInfo = await this.getInfo();
    const userId = accountInfo.userId;

    // const res: any = await this.makeRequest({
    //   method: 'GET',
    //   requestPath: 'spot/v1/public/currencies',
    //   version: 1,
    // });
    // const data = uniq(
    //   res
    //     .map(({ chains }: any) => chains)
    //     .flat()
    //     .map(({ chain }: { chain: string }) => chain)
    // );
    // const chunked = chunkArray(data, 50);
    // for (const chunk of chunked) {
    //   console.log(chunk);
    // }

    const subAccountAssets = await this.getSubAccAssets();
    const isAllTokens = !tokens.length;

    for (const subAcc of subAccountAssets) {
      for (const asset of subAcc.assetsList) {
        const amount = +asset.available;
        const logAmount = `${getTrimmedLogsAmount(+amount, asset.coin as Tokens)}`;
        if (amount > 0 && (tokens.includes(asset.coin) || isAllTokens)) {
          const subAccUserId = subAcc.userId;

          this.logger.info(`Transferring [${logAmount}] from [${subAccUserId}] to main account...`);

          try {
            await this.subAccTransfer({
              fromType: 'spot',
              toType: 'spot',
              amount,
              coin: asset.coin,
              fromUserId: subAccUserId,
              toUserId: userId,
            });

            this.logger.success(`Transferred [${logAmount}] from [${subAccUserId}] to main account`);

            await sleep(1);
          } catch (err) {
            if (err instanceof AxiosError) {
              if ((err.response?.data?.msg || '').includes('Parameter amount error')) {
                this.logger.warning(`Amount [${logAmount}] is too low to make transfer`);
                return;
              }
            }
            throw err;
          }
        }
      }
    }
  }

  // REQUESTS
  private async getSubAccAssets() {
    return this.makeRequest({
      method: 'GET',
      requestPath: '/spot/account/subaccount-assets',
    });
  }
  private async subAccTransfer(body: SubAccTransfer) {
    return this.makeRequest({
      method: 'POST',
      requestPath: '/spot/wallet/subaccount-transfer',
      body,
    });
  }
  private async getInfo() {
    return this.makeRequest({
      method: 'GET',
      requestPath: '/spot/account/info',
    });
  }
  private async getAssets(props?: GetAssets) {
    return this.makeRequest({
      method: 'GET',
      requestPath: '/spot/account/assets',
      params: props,
    });
  }
  private async withdraw({ network, ...restProps }: Withdraw) {
    const body = {
      ...restProps,
      ...(!!network && { chain: this.getCorrectNetwork(network) }),
    };

    return this.makeRequest({
      method: 'POST',
      requestPath: '/spot/wallet/withdrawal',
      body,
    });
  }

  private async makeRequest({ method, requestPath, body, params = {}, version = 2 }: MakeRequest) {
    this.keysGuard();

    const path = method === 'GET' ? requestPath + getQueryString(params) : requestPath;
    const timestamp = dayjs().valueOf();

    const versionPath = version === 2 ? '/v2' : '/';
    const dataToSend = body ? JSON.stringify(body) : '';
    const hash = `${timestamp}` + method + `/api${versionPath}` + path + dataToSend;
    const hmac = crypto.createHmac('sha256', BITGET.secret);
    hmac.update(hash);
    const sign = hmac.digest('base64');

    const headers = {
      'Content-Type': 'application/json',
      'ACCESS-KEY': BITGET.apiKey,
      'ACCESS-PASSPHRASE': BITGET.passphrase,
      'ACCESS-SIGN': sign,
      'ACCESS-TIMESTAMP': `${timestamp}`,
      locale: 'en-US',
    };

    const config = await getAxiosConfig({ headers, proxyAgent: this.proxyAgent });
    const { data } = await axios({
      method,
      url: `${API_URL}${versionPath}` + path,
      ...(!!body && { data: body }),
      ...config,
    });

    return data?.data ? data.data : data;
  }

  // UTILS
  private getCorrectNetwork(network: SupportedNetworks) {
    switch (network) {
      case 'bsc':
        return 'BEP20';
      case 'core':
        return 'COREDAO';
      case 'eth':
        return 'ERC20';
      case 'arbitrum':
        return 'Arbitrum One';
      case 'zkSync':
        return 'zkSyncEra';
      case 'optimism':
        return 'Optimism';
      case 'polygon':
        return 'Polygon';
      case 'avalanche':
        return 'C-Chain';

      default:
        return network.toUpperCase();
    }
  }

  private keysGuard() {
    if (!BITGET.apiKey || !BITGET.secret || !BITGET.passphrase) {
      throw new Error(BITGET_KEYS_ERROR);
    }
  }
}
