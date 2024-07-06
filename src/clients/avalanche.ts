import { avalanche } from 'viem/chains';

import { AVALANCHE_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { AvalancheTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class AvalancheClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(avalanche, logger, Networks.AVALANCHE, wallet);
  }

  async getBalanceByToken(tokenName: AvalancheTokens) {
    const contractInfo = getTokenContract({
      contracts: AVALANCHE_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IAvalancheClient = AvalancheClient;
