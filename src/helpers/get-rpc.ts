import { RPC } from '../_inputs/settings';
import { PUBLIC_RPCS } from '../constants';
import { Networks } from '../types';
import { getRandomItemFromArray } from './utils';

export const getAllRpcs = (networkName: Networks) => {
  let rpcs = PUBLIC_RPCS[networkName];
  const privateRpc = RPC[networkName];

  if (privateRpc) {
    rpcs = [privateRpc, ...rpcs];
  }
  return rpcs;
};

export const getRpc = (networkName: Networks) => {
  const rpcs = PUBLIC_RPCS[networkName];
  const privateRpc = RPC[networkName];

  return privateRpc || getRandomItemFromArray(rpcs);
};
