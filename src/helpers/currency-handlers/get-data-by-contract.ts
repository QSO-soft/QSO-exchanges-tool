import { Hex } from 'viem';

import { defaultTokenAbi } from '../../clients/abi';
import { ClientType } from '../clients';

interface GetDataByContract {
  client: ClientType;
  contractAddress: Hex | 'native';
}

export const getCurrentBalanceByContract = async ({ client, contractAddress }: GetDataByContract) => {
  const isNativeContract = contractAddress === 'native';
  let currentBalance;

  if (isNativeContract) {
    currentBalance = await client.getNativeBalance();
  } else {
    currentBalance = await client.getBalanceByContract({
      name: contractAddress,
      address: contractAddress,
      abi: defaultTokenAbi,
    });
  }

  return { ...currentBalance, isNativeContract };
};

export const getCurrentSymbolByContract = async ({ client, contractAddress }: GetDataByContract) => {
  const isNativeContract = contractAddress === 'native';
  let symbol;

  if (isNativeContract) {
    symbol = client.chainData.nativeCurrency.symbol;
  } else {
    symbol = await client.getSymbolByContract({
      name: contractAddress,
      address: contractAddress,
      abi: defaultTokenAbi,
    });
  }

  return { symbol, isNativeContract };
};
