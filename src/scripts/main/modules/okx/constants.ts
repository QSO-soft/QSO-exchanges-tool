import { OkxNetworks } from '../../../../types';

export const OKX_NETWORK_MAP: Record<OkxNetworks, string> = {
  bsc: 'BSC',
  eth: 'ERC20',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum One',
  avalanche: 'Avalanche C-Chain',
  optimism: 'Optimism',
  zkSync: 'zkSync Era',
  base: 'Base',
  linea: 'Linea',
  fantom: 'Fantom',
  core: 'CORE',
  celo: 'CELO-TOKEN',
  klay: 'Klaytn',
  aptos: 'Aptos',
};

export const OKX_FEE_NETWORK_MAP: Record<OkxNetworks, string> = {
  bsc: 'BEP20',
  eth: 'ERC20',
  polygon: 'MATIC',
  arbitrum: 'Arbitrum One',
  avalanche: 'Avalanche C',
  optimism: 'OPTIMISM',
  zkSync: 'zkSync Era',
  base: 'Base',
  linea: 'Linea',
  fantom: 'FTM',
  core: 'CORE',
  celo: 'CELO',
  klay: 'KLAY',
  aptos: 'APT',
};
