import {
  ARBITRUM_TOKEN_CONTRACTS,
  AVALANCHE_TOKEN_CONTRACTS,
  BASE_TOKEN_CONTRACTS,
  BNB_TOKEN_CONTRACTS,
  ETH_TOKEN_CONTRACTS,
  LINEA_TOKEN_CONTRACTS,
  OPTIMISM_TOKEN_CONTRACTS,
  POLYGON_TOKEN_CONTRACTS,
  SCROLL_TOKEN_CONTRACTS,
  ZKSYNC_TOKEN_CONTRACTS,
  ZORA_TOKEN_CONTRACTS,
} from '../constants';
import { Networks, SupportedNetworks, TokenContract } from '../types';

export interface GetTokenContractArgs {
  tokenName?: string;
  contracts?: TokenContract[];
  network?: SupportedNetworks;
}
export const getTokenContract = ({ contracts, tokenName, network }: GetTokenContractArgs): TokenContract => {
  if (!tokenName) {
    throw new Error('Token name was not specified');
  }

  const currentContracts = contracts || (network ? getContractsByNetwork(network) : undefined);

  const tokenInfo = currentContracts?.find(({ name }) => name === tokenName);

  if (!tokenInfo) {
    throw new Error(`We can not find token with ${tokenName} name`);
  }

  return tokenInfo;
};

export const getContractsByNetwork = (network: SupportedNetworks) => {
  switch (network) {
    case Networks.ETH:
      return ETH_TOKEN_CONTRACTS;
    case Networks.BSC:
    case Networks.OP_BNB:
      return BNB_TOKEN_CONTRACTS;
    case Networks.AVALANCHE:
      return AVALANCHE_TOKEN_CONTRACTS;
    case Networks.ARBITRUM:
      return ARBITRUM_TOKEN_CONTRACTS;
    case Networks.ZORA:
      return ZORA_TOKEN_CONTRACTS;
    case Networks.BASE:
      return BASE_TOKEN_CONTRACTS;
    case Networks.OPTIMISM:
      return OPTIMISM_TOKEN_CONTRACTS;
    case Networks.POLYGON:
      return POLYGON_TOKEN_CONTRACTS;
    case Networks.ZKSYNC:
      return ZKSYNC_TOKEN_CONTRACTS;
    case Networks.LINEA:
      return LINEA_TOKEN_CONTRACTS;
    case Networks.SCROLL:
      return SCROLL_TOKEN_CONTRACTS;

    default:
      throw new Error(`Unable to find contracts for ${network} network`);
  }
};
