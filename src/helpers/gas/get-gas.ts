import { formatGwei, PublicClient } from 'viem';

export async function getCurrentGas(publicClient: PublicClient) {
  const gas = await publicClient.getGasPrice();

  return parseFloat(formatGwei(gas));
}
