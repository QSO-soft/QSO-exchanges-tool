import uniq from 'lodash/uniq';

import { defaultTokenAbi } from '../../clients/abi';
import { WALLETS_REQUIRED } from '../../constants';
import { BetweenModulesEntity } from '../../scripts/main/db/entities';
import { FindModuleReturnFc, NetworksArray, SupportedNetworks, Tokens } from '../../types';
import { getClientByNetwork } from '../clients';
import { findDbItem, recreateDbItem } from '../db-helper';
import { getTokenContract } from '../get-token-contract';
import { getRandomItemFromArray, shuffleArray } from '../utils';
import { TransactionCallbackParams, TransactionCallbackReturn } from './types';

interface ExecuteFlowParams extends TransactionCallbackParams {
  executeCallback: FindModuleReturnFc;
}
export const executeFlow = async (params: ExecuteFlowParams): TransactionCallbackReturn => {
  const {
    executeCallback,
    moduleIndex,
    moduleName,
    dbSource,
    minBalanceByToken,
    wallet,
    tokenToSupply,
    logger,
    flows,
  } = params;

  if (!wallet) {
    return {
      status: 'critical',
      message: WALLETS_REQUIRED,
    };
  }

  const { item, dbRepo } = await findDbItem({
    entity: BetweenModulesEntity,
    moduleName,
    moduleIndex,
    wallet,
    dbSource,
  });

  let currentItem = item;
  let flow: NetworksArray | null = null;

  if (currentItem && currentItem.currentFlow && JSON.parse(currentItem.currentFlow).length) {
    flow = JSON.parse(currentItem.currentFlow) as NetworksArray;
  } else {
    const firstFlowNetworks = uniq(flows.map((flow) => flow[0]));

    const currentFlows: NetworksArray[] = [];
    for (const network of shuffleArray(firstFlowNetworks)) {
      const client = getClientByNetwork(network, logger, wallet);
      const nativeToken = client.chainData.nativeCurrency.symbol as Tokens;

      const currentToken = tokenToSupply || nativeToken;

      const isNativeToken = currentToken === nativeToken;

      let tokenContractInfo;
      if (!isNativeToken) {
        const tokenContract = getTokenContract({
          tokenName: currentToken,
          network,
        }).address;

        tokenContractInfo = isNativeToken
          ? undefined
          : {
              name: currentToken,
              address: tokenContract,
              abi: defaultTokenAbi,
            };
      }

      const balance = await client.getNativeOrContractBalance(isNativeToken, tokenContractInfo);

      if (balance.int > (minBalanceByToken?.[currentToken] || 0)) {
        currentFlows.push(...flows.filter((flow) => flow[0] === network));
      }
    }

    if (currentFlows.length) {
      flow = getRandomItemFromArray(currentFlows);
    } else {
      return {
        status: 'error',
        message: 'No one provided network has balance more than provided in minBalanceByToken',
      };
    }

    currentItem = await recreateDbItem({
      dbSource,
      wallet,
      moduleIndex,
      moduleName,
      entity: BetweenModulesEntity,
      data: {
        network: flow[0],
        currentFlow: JSON.stringify(flow),
      },
    });
  }

  let currentFlow = flow;
  for (let i = 0; i < flow.length; i++) {
    const network = flow[i] as SupportedNetworks;
    const destinationNetwork = flow[i + 1];

    if (destinationNetwork) {
      const res = await executeCallback({
        ...params,
        network,
        destinationNetwork,
        isInnerWorker: true,
      });

      const { status } = res;

      if (status === 'error' || status === 'warning' || status === 'critical') {
        return res;
      }

      currentFlow = currentFlow!.slice(1) as NetworksArray;
      await dbRepo.update(currentItem.id, {
        currentFlow: JSON.stringify(currentFlow),
      });
    }
  }

  await dbRepo.update(currentItem.id, {
    currentFlow: '',
  });

  return {
    status: 'success',
  };
};
