import { celo } from 'viem/chains';

import { CELO_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { CeloTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class CeloClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(celo, logger, Networks.CELO, wallet);
  }

  async getBalanceByToken(tokenName: CeloTokens) {
    const contractInfo = getTokenContract({ contracts: CELO_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type ICeloClient = CeloClient;
