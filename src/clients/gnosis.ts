import { gnosis } from 'viem/chains';

import { GNOSIS_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { GnosisTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class GnosisClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(gnosis, logger, Networks.GNOSIS, wallet);
  }

  async getBalanceByToken(tokenName: GnosisTokens) {
    const contractInfo = getTokenContract({ contracts: GNOSIS_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IGnosisClient = GnosisClient;
