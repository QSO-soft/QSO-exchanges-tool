import { mainnet } from 'viem/chains';

import { ETH_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { EthTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class EthClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(mainnet, logger, Networks.ETH, wallet);
  }

  async getBalanceByToken(tokenName: EthTokens) {
    const contractInfo = getTokenContract({ contracts: ETH_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IEthClient = EthClient;
