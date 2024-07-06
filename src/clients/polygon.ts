import { polygon } from 'viem/chains';

import { POLYGON_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, PolygonTokens, WalletData } from '../types';
import { DefaultClient } from './default-client';

export class PolygonClient extends DefaultClient {
  constructor(logger: LoggerType, wallet?: WalletData) {
    super(polygon, logger, Networks.POLYGON, wallet);
  }

  async getBalanceByToken(tokenName: PolygonTokens) {
    const contractInfo = getTokenContract({
      contracts: POLYGON_TOKEN_CONTRACTS,
      tokenName,
    });
    return this.getBalanceByContract(contractInfo);
  }
}

export type IPolygonClient = PolygonClient;
