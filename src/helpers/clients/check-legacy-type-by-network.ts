import { SupportedNetworks } from '../../types';

export const checkLegacyTypeByNetwork = (network: SupportedNetworks) => {
  const legacyTypeNetworks: SupportedNetworks[] = ['scroll'];

  return legacyTypeNetworks.includes(network);
};
