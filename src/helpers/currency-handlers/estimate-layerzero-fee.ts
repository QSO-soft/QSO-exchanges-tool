import { Abi, Hex, Narrow, PublicClient } from 'viem';

interface EstimateLayerzeroFee {
  adapterParams: Hex;
  publicClient: PublicClient;
  contract: Hex;
  destNetwork: number;
  abi: Narrow<Abi | readonly unknown[]>;
}

export const estimateLayerzeroFee = async ({
  adapterParams,
  publicClient,
  contract,
  destNetwork,
  abi,
}: EstimateLayerzeroFee): Promise<bigint> => {
  const txValue = (await publicClient.readContract({
    address: contract,
    abi,
    functionName: 'estimateGasBridgeFee',
    args: [destNetwork, false, adapterParams],
  })) as [bigint, bigint];

  return txValue[0];
};
