import { moonbeam } from 'viem/chains';

import { MOONBEAM_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { MoonbeamTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class MoonbeamClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(moonbeam, logger, Networks.MOONBEAN, wallet);
  }

  async getBalanceByToken(tokenName: MoonbeamTokens) {
    const contractInfo = getTokenContract({ contracts: MOONBEAM_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IMoonbeamClient = MoonbeamClient;
