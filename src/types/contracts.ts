import { Hex } from 'viem';
import { ContractAbi } from 'web3';

export interface TokenContract {
  name: string;
  address: Hex;
  abi: ContractAbi;
  decimals?: number;
}
