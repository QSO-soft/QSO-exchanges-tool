import {
  getTrimmedLogsAmount,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Tokens, TransformedModuleParams } from '../../../../types';

export const execCheckNativeBalance = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: `Execute check native balance of ${params.network}...`,
    transactionCallback: makeCheckBalance,
  });

const makeCheckBalance = async (props: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, network, minNativeBalance } = props;

  const { int: nativeBalance } = await client.getNativeBalance();

  const logNativeBalance = `${getTrimmedLogsAmount(nativeBalance, client.chainData.nativeCurrency.symbol as Tokens)}`;
  // TODO: make not only for native balance
  if (nativeBalance >= minNativeBalance && minNativeBalance !== 0) {
    const message = `Native balance [${logNativeBalance}] of [${network}] already more than or equals [${minNativeBalance}]`;
    return {
      status: 'passed',
      message,
    };
  }

  const message = `Native balance [${logNativeBalance}] of [${network}] less than [${minNativeBalance}]`;

  return {
    status: 'success',
    message,
  };
};
