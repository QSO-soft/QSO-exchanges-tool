import { coreDao } from 'viem/chains';

import { CORE_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { CoreTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class CoreClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(coreDao, logger, Networks.CORE, wallet);
  }

  async getBalanceByToken(tokenName: CoreTokens) {
    const contractInfo = getTokenContract({ contracts: CORE_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type ICoreClient = CoreClient;
