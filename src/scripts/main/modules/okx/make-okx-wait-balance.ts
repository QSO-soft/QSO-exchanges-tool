import uniq from 'lodash/uniq';

import {
  getTrimmedLogsAmount,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Okx } from '../../../../managers/okx';
import { TransformedModuleParams } from '../../../../types';
import { execOkxCollect } from './make-okx-collect';

export const execOkxWaitBalance = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make OKX wait balance...',
    transactionCallback: okxWaitBalance,
  });

const okxWaitBalance = async (props: TransactionCallbackParams): TransactionCallbackReturn => {
  const { waitTime, waitBalance, logger, collectTokens } = props;

  const uniqueCollectTokens = uniq(collectTokens);

  const okx = new Okx({
    logger,
  });

  const resBalances: string[] = [];
  let balanceIsOkay = false;
  while (!balanceIsOkay) {
    await execOkxCollect({
      ...props,
      isInnerWorker: true,
    });

    const currentBalancesOkay: string[] = [];
    for (const token of uniqueCollectTokens) {
      const currentTokenBalance = await okx.getMainAccountBalanceByToken(token);

      if (currentTokenBalance < waitBalance) {
        logger.warning(
          `Balance of [${getTrimmedLogsAmount(currentTokenBalance, token)}] is lower than waitBalance [${waitBalance}]`
        );
        balanceIsOkay = false;
      } else {
        currentBalancesOkay.push(getTrimmedLogsAmount(currentTokenBalance, token));
        balanceIsOkay = true;
      }
    }

    if (!balanceIsOkay) {
      await sleep(waitTime);
    } else {
      resBalances.push(...currentBalancesOkay);
    }
  }

  const resMsg = `Balances: ${resBalances.join(' | ')}`;

  return {
    status: 'success',
    message: resMsg,
    tgMessage: resMsg,
  };
};
