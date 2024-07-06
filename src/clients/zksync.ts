import { zkSync } from 'viem/chains';

import { ZKSYNC_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, WalletData, ZkSyncTokens } from '../types';
import { DefaultClient } from './default-client';

export class ZkSyncClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(zkSync, logger, Networks.ZKSYNC, wallet);
  }

  async getBalanceByToken(tokenName: ZkSyncTokens) {
    const contractInfo = getTokenContract({
      contracts: ZKSYNC_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IZkSyncClient = ZkSyncClient;
