import { linea } from 'viem/chains';

import { LINEA_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { LineaTokens, Networks, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class LineaClient extends DefaultClient {
  constructor(logger: LoggerType, wallet: WalletData) {
    super(linea, logger, Networks.LINEA, wallet);
  }

  async getBalanceByToken(tokenName: LineaTokens) {
    const contractInfo = getTokenContract({ contracts: LINEA_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

export type ILineaClient = LineaClient;
