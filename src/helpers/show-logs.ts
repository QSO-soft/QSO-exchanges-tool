import settings from '../_inputs/settings/settings';
import { Logger, LoggerData, LoggerType } from '../logger';
import { Route, RouteSettings, SupportedNetworks, Tokens, TransformedModuleConfig } from '../types';

export const getTrimmedLogsAmount = (amount: number, token?: Tokens) => {
  let floatNumber = settings.logsTrimNumber.default;
  if (token) {
    const floatTokenNumber = settings.logsTrimNumber[token];

    floatNumber = typeof floatTokenNumber === 'number' ? floatTokenNumber : floatNumber;
  }

  return `${+amount.toFixed(floatNumber)}${token ? ' ' + token : ''}`;
};
export const showLogSelectedModules = (routeSettings: RouteSettings, route: Route, logger: LoggerType) => {
  const moduleNames = routeSettings.modules.map(({ moduleName }) => moduleName);
  const selectedModules = moduleNames.join(',\n');

  logger.success(`Route [${route}] will be launched with [${selectedModules}] modules`);
};

export const showLogPreparedModules = (preparedModules: TransformedModuleConfig[], logger: LoggerType) => {
  const modules = preparedModules
    .reduce<string[]>((acc, cur) => {
      const {
        srcToken,
        destTokens,
        contractPairs,
        moduleName,
        contractAddresses,
        delay,
        projectAddresses,
        flows,
        minAndMaxAmount,
        ...restProps
      } = cur;

      const swapsDataToSwow = contractPairs ? { contractPairs } : { srcToken, destTokens };
      const objectToShow = {
        ...restProps,
        ...swapsDataToSwow,
        ...(!!contractAddresses && { contractAddress: contractAddresses.length }),
        ...(!!projectAddresses && { projectAddresses: projectAddresses.length }),
        ...(!!delay &&
          !(delay[0] === 0 && delay[1] === 0) && {
            delay,
          }),
        ...(!!minAndMaxAmount && {
          minAndMaxAmount: [+getTrimmedLogsAmount(minAndMaxAmount[0]), +getTrimmedLogsAmount(minAndMaxAmount[1])],
        }),
      };
      return [...acc, `--- ${moduleName}: ${JSON.stringify(objectToShow)}`];
    }, [])
    .join(',\n');

  logger.success(`Modules was prepared:\n${modules}`);
};

interface LogMakeBridge {
  amount: number;
  network: SupportedNetworks;
  destinationNetwork: SupportedNetworks;
  token: Tokens;
  logger: LoggerType;
  fee?: number;
  logTemplate?: LoggerData;
}
export const showLogMakeBridge = ({ logger, destinationNetwork, network, token, amount, fee }: LogMakeBridge) => {
  logger.info(
    `Making bridge of [${getTrimmedLogsAmount(amount, token)}] from ${network} to ${destinationNetwork}${
      fee ? `. Total fee is [${fee}]` : ''
    }`
  );
};

interface LogMakeWithdraw {
  amount: number;
  network: SupportedNetworks;
  token: Tokens;
  logger: LoggerType;
  cex: string;
  logTemplate?: LoggerData;
}
export const showLogMakeWithdraw = ({ logger, network, token, amount, cex, logTemplate }: LogMakeWithdraw) => {
  logger.info(`Withdrawing [${getTrimmedLogsAmount(amount, token)}] in ${network} via ${cex}`, logTemplate);
};

interface LogMakeSwap {
  amount: number;
  srcToken: Tokens;
  dstToken: Tokens;
  logger: LoggerType;
  logTemplate?: LoggerData;
}
export const showLogMakeSwap = ({ logger, amount, srcToken, dstToken, logTemplate }: LogMakeSwap) => {
  logger.info(`Swapping [${getTrimmedLogsAmount(amount)}] from ${srcToken} to ${dstToken}...`, logTemplate);
};
interface WalletToppedUp {
  cex: string;
  balance: number;
  token: Tokens;
}
export const getLogMsgWalletToppedUp = ({ cex, token, balance }: WalletToppedUp) => {
  return `Your wallet was successfully topped up from ${cex}. Current balance is [${getTrimmedLogsAmount(
    balance,
    token
  )}]`;
};
interface WalletToppedUpTg {
  amount: number;
  balance: number;
  token: Tokens;
}
export const getLogMsgWalletToppedUpTg = ({ amount, token, balance }: WalletToppedUpTg) => {
  return `Withdrew ${getTrimmedLogsAmount(amount, token)} | Balance ${getTrimmedLogsAmount(balance, token)}`;
};

const buildFileName = (fileName: string) => {
  return `${fileName}.log`;
};

export const initLocalLogger = (folderName: string, fileName: string) =>
  new Logger(folderName, buildFileName(fileName));
