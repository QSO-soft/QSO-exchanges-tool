import { Hex } from 'viem';

import { ClientType, GetGasOptionsRes } from '../../../helpers';
import { LoggerType } from '../../../logger';
import { HttpMethod, NumberRange, SupportedNetworks, Tokens } from '../../../types';

export interface BitgetConstructor {
  logger: LoggerType;
  client?: ClientType;
  network?: SupportedNetworks;
  hideExtraLogs?: boolean;
}

export interface BitgetWithdraw {
  token: Tokens;
  waitSleep?: NumberRange;
  minTokenBalance?: number;
  amount: number;
  walletAddress: Hex;
}
export interface BitgetDeposit {
  token: Tokens;
  toAddress: Hex;
  minAndMaxAmount: NumberRange;
  client: ClientType;
  gasOptions: GetGasOptionsRes;
  usePercentBalance?: boolean;
  minAmount?: number;
  minTokenBalance?: number;
}
export interface BitgetTransferFromAccsToMain {
  tokens: Tokens[];
}

export type BitgetAccountTypes = 'spot' | 'p2p' | 'coin_futures' | 'usdt_futures' | 'cross_margin' | 'isolated_margin';

export interface Dictionary {
  [key: string]: string;
}

export interface MakeRequest {
  method: HttpMethod;
  requestPath: string;
  body?: object;
  params?: object;
  version?: 1 | 2;
}
export interface SubAccTransfer {
  fromType: BitgetAccountTypes;
  toType: BitgetAccountTypes;
  amount: number;
  coin: Tokens;
  fromUserId: number;
  toUserId: number;
  symbol?: string;
  clientOid?: string;
}
export interface GetSubAccDepositAddress {
  sub_uid: number;
  coin: Tokens;
  network?: SupportedNetworks;
}
export interface GetAssets {
  coin: Tokens;
  assetType?: 'hold_only' | 'all';
}
export interface Withdraw {
  coin: Tokens;
  network: SupportedNetworks;
  transferType: 'on_chain' | 'internal_transfer';
  address: string;
  size: number;
  innerToType?: string;
  areaCode?: string;
  tag?: string;
  remark?: string;
  clientOid?: string;
}
