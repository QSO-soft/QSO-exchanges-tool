import { bsc } from 'viem/chains';

import { BNB_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { BnbTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class BscClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(bsc, logger, Networks.BSC, wallet);
  }

  async getBalanceByToken(tokenName: BnbTokens) {
    const contractInfo = getTokenContract({
      contracts: BNB_TOKEN_CONTRACTS,
      tokenName,
    });

    return this.getBalanceByContract(contractInfo);
  }
}

export type IBscClient = BscClient;
