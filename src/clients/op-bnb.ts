import { opBNB } from 'viem/chains';

import { BNB_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { BnbTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class OpBnbClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(opBNB, logger, Networks.OP_BNB, wallet);
  }

  async getBalanceByToken(tokenName: BnbTokens) {
    const contractInfo = getTokenContract({
      contracts: BNB_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IOpBnbClient = OpBnbClient;
