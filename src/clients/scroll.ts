import { scroll } from 'viem/chains';

import { SCROLL_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, ScrollTokens, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class ScrollClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(scroll, logger, Networks.SCROLL, wallet);
  }

  async getBalanceByToken(tokenName: ScrollTokens) {
    const contractInfo = getTokenContract({
      contracts: SCROLL_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IScrollClient = ScrollClient;
