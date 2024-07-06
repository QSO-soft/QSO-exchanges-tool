import { fantom } from 'viem/chains';

import { EVM_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { EvmTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class FantomClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(fantom, logger, Networks.FANTOM, wallet);
  }

  async getBalanceByToken(tokenName: EvmTokens) {
    const contractInfo = getTokenContract({ contracts: EVM_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IFantomClient = FantomClient;
