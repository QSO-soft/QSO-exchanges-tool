import { optimism } from 'viem/chains';

import { OPTIMISM_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, OptimismTokens, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class OptimismClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(optimism, logger, Networks.OPTIMISM, wallet);
  }

  async getBalanceByToken(tokenName: OptimismTokens) {
    const contractInfo = getTokenContract({ contracts: OPTIMISM_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IOptimismClient = OptimismClient;
