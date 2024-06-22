import { AxiosError } from 'axios';
import MoralisLib from 'moralis';

import { MORALIS_KEY } from '../../_inputs/settings';
import { getSpentGas, sleep } from '../../helpers';
import { LoggerType } from '../../logger';
import { GetTx, GetTxData, GetTxs, MoralisTx } from './types';

const apiKeyIdEmptyErr = 'apiKeyId should not be empty';
export class Moralis {
  async init(logger?: LoggerType) {
    try {
      if (!MORALIS_KEY) {
        throw new Error('Please provide MORALIS_KEY in global.js');
      }

      await MoralisLib.start({
        apiKey: MORALIS_KEY,
      });

      await MoralisLib.EvmApi.marketData.getTopCryptoCurrenciesByMarketCap();
    } catch (e) {
      const invalidMoralisKeyMgs = 'MORALIS_KEY is invalid. Please provide correct one in global.js';

      let errMsg = (e as Error).message;

      if (errMsg.includes('Token is invalid format') || errMsg.includes('invalid signature')) {
        errMsg = invalidMoralisKeyMgs;
      }

      logger?.error(errMsg);

      if (errMsg.includes('Modules are started already. This method should be called only one time.')) {
        return;
      } else {
        throw e;
      }
    }
  }

  async getTxs(params: GetTxs): Promise<MoralisTx[]> {
    let cursor;
    let shouldStop = false;
    const allTxs = [];

    while (!shouldStop) {
      try {
        const { currentCursor, txs } = await this.getTxsPage(params, cursor);

        allTxs.push(...txs);
        cursor = currentCursor;
      } catch (err) {
        let errMessage = (err as Error).message;

        if (errMessage.includes(apiKeyIdEmptyErr)) {
          await sleep(20);

          continue;
        }

        if (err instanceof AxiosError) {
          errMessage = err.response?.data.message || errMessage;
        }
        if (errMessage.includes('Not found')) return [];

        throw err;
      }

      if (!cursor) {
        shouldStop = true;
      } else {
        await sleep(20);
      }
    }

    return allTxs as MoralisTx[];
  }
  async getTxsPage(params: GetTxs, cursor?: string) {
    const { chainId, walletAddress } = params;

    const response = await MoralisLib.EvmApi.transaction.getWalletTransactions({
      address: walletAddress,
      chain: chainId,
      cursor,
      limit: 100,
    });

    const result = response.toJSON();

    const txs = result.result;
    const currentCursor = response.pagination.cursor;

    return {
      currentCursor,
      txs,
    };
  }

  async getTx(params: GetTx): Promise<MoralisTx | undefined> {
    const { chainId, txHash } = params;

    try {
      const response = await MoralisLib.EvmApi.transaction.getTransaction({
        chain: chainId,
        transactionHash: txHash,
      });

      const result = response?.toJSON();

      if (!result) return;
      return result as MoralisTx;
    } catch (err) {
      let errMessage = (err as Error).message;

      if (errMessage.includes(apiKeyIdEmptyErr)) {
        return this.getTx(params);
      }

      if (err instanceof AxiosError) {
        errMessage = err.response?.data.message || errMessage;
      }

      if (errMessage.includes('Not found')) return;

      throw err;
    }
  }

  getTxData({ txs, method, to }: GetTxData) {
    return txs.find(({ input, to_address }) => {
      const toContractLc = to.toLowerCase();

      return input.startsWith(method) && to_address.toLowerCase() === toContractLc;
    });
  }

  getSpentGas(data?: MoralisTx) {
    return data ? getSpentGas(data.gas_price, data.receipt_gas_used) : 0;
  }
}
