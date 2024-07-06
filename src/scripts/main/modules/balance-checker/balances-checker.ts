import {
  transactionWorker,
  getCurrentBalanceByContract,
  getCurrentSymbolByContract,
  getSavedCheckersMessage,
  saveCheckerDataToCSV,
  TransactionCallbackParams,
  TransactionCallbackReturn,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';

export const execBalanceChecker = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: `Execute check balances of ${params.contractAddress} in ${params.network}...`,
    transactionCallback: makeBalanceChecker,
  });

const makeBalanceChecker = async (props: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, walletAddress, network, wallet, contractAddress } = props;

  const { int: intBalance } = await getCurrentBalanceByContract({ client, contractAddress });
  const { symbol } = await getCurrentSymbolByContract({ client, contractAddress });

  const fileName = 'balance-checker';

  const dataToSave = {
    walletAddress: walletAddress || wallet?.walletAddress,
    amount: intBalance,
    currency: symbol,
    network,
  };

  await saveCheckerDataToCSV({
    data: dataToSave,
    fileName,
    additionalFilterFields: ['network', 'currency'],
  });

  return {
    status: 'success',
    message: getSavedCheckersMessage(fileName),
  };
};
