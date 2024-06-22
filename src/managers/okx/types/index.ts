import { PublicClient } from 'viem';

import type { LoggerType } from '../../../logger';
import type { NumberRange } from '../../../types';

export interface OkxApiSecrets {
  apiKey: string;
  secret: string;
  password: string;
}

export interface OkxRandom {
  withdrawToAmount: NumberRange;
  withdrawFees: number;
  incrBaseSleepDelay?: number;
}

export interface OkxGlobal {
  accountName: string;
  collectAccountEmail: string;
  proxy: string;
  accounts: {
    [key: string]: OkxApiSecrets;
  };
}

export interface OkxConstructor {
  logger?: LoggerType;
  random?: OkxRandom;
  amount?: number;
  hideExtraLogs?: boolean;
  secrets?: OkxApiSecrets;
}

export interface TransferBalance {
  symbol: string;
  amount: number;
}
export interface TransferBalanceFromSubToMain extends TransferBalance {
  subAccName: string;
}
export interface TransferBalanceToAnotherAcc extends TransferBalance {
  email: string;
}

type Method = 'GET' | 'POST';

export interface GetSignatureProps {
  timeStamp: string;
  method: Method;
  requestPath: string;
  body: string;
}

export interface GetAuthHeadersProps {
  requestPath: string;
  method?: Method;
  body?: string;
}

export interface CheckWithdrawal {
  id: string;
  publicClient: PublicClient;
}
