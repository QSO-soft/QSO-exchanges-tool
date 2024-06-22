import { arbitrum } from 'viem/chains';

import { ARBITRUM_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { ArbitrumTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class ArbitrumClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(arbitrum, logger, Networks.ARBITRUM, wallet);
  }

  async getBalanceByToken(tokenName: ArbitrumTokens) {
    const contractInfo = getTokenContract({
      contracts: ARBITRUM_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IArbitrumClient = ArbitrumClient;
