import { base } from 'viem/chains';

import { BASE_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { BaseTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class BaseClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(base, logger, Networks.BASE, wallet);
  }

  async getBalanceByToken(tokenName: BaseTokens) {
    const contractInfo = getTokenContract({ contracts: BASE_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IBaseClient = BaseClient;
