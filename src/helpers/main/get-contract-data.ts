import { defaultTokenAbi } from '../../clients/abi';
import { SupportedNetworks, TokenContract, Tokens } from '../../types';
import { getTokenContract } from '../get-token-contract';

interface GetContractData {
  nativeToken: Tokens;
  network: SupportedNetworks;
  token?: Tokens;
}
export const getContractData = ({ nativeToken, token, network }: GetContractData) => {
  let tokenContractInfo;

  const currentToken = token || nativeToken;
  const isNativeToken = currentToken === nativeToken;

  if (!isNativeToken) {
    const tokenContract = getTokenContract({
      tokenName: currentToken,
      network,
    });

    tokenContractInfo = {
      name: currentToken,
      address: tokenContract.address,
      abi: defaultTokenAbi,
    } as TokenContract;
  }

  return { tokenContractInfo, isNativeToken, token: currentToken };
};
