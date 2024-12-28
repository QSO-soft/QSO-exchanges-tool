import { Hex } from 'viem';

export type NetworksRecord = Record<Networks, string>;
export type RPCsRecord = Record<Networks, string[]>;

export enum Networks {
  BSC = 'bsc',
  OP_BNB = 'opBNB',
  ETH = 'eth',

  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',

  ZKSYNC = 'zkSync',
  ZKFAIR = 'zkFair',
  POLYGON_ZKEVM = 'polygon_zkevm',

  BASE = 'base',
  LINEA = 'linea',
  SCROLL = 'scroll',
  FANTOM = 'fantom',

  CORE = 'core',
  CELO = 'celo',
  ZORA = 'zora',

  GNOSIS = 'gnosis',
  KLAY = 'klay',

  MOONBEAN = 'moonbeam',

  APTOS = 'aptos',
  STARKNET = 'starknet',

  BLAST = 'blast',
}

export const SUPPORTED_NETWORKS = [
  'bsc',
  'opBNB',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'zkFair',
  'polygon_zkevm',
  'base',
  'linea',
  'scroll',
  'fantom',
  'core',
  'celo',
  'zora',
  'gnosis',
  'klay',
  'aptos',
  'holesky',
  'moonbeam',
  'blast',
] as const;
export type SupportedNetworks = (typeof SUPPORTED_NETWORKS)[number];

export const BINANCE_NETWORKS = [
  'bsc',
  'opBNB',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'base',
  'fantom',
  'celo',
  'klay',
  'scroll',
] as const;

export type BinanceNetworks = (typeof BINANCE_NETWORKS)[number];

export const OKX_NETWORKS = [
  'bsc',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'base',
  'linea',
  'fantom',
  'core',
  'celo',
  'klay',
  'aptos',
  'solana',
] as const;
export type OkxNetworks = (typeof OKX_NETWORKS)[number];

export interface BinanceTokenData {
  coin: string;
  name: string;
  networkList: BinanceNetworkData[];
}

export interface BinanceNetworkData {
  network: string;
  coin: string;
  withdrawIntegerMultiple: string;
  name: string;
  withdrawFee: string;
  withdrawMin: string;
  withdrawMax: string;
  contractAddress: string;
}

export type NetworkContractsObj = Partial<Record<SupportedNetworks, Hex>>;
export type NetworkStringsObj = Partial<Record<SupportedNetworks, string>>;
export type NetworkNumbersObj = Partial<Record<SupportedNetworks, number>>;
