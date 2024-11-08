import { Account, Chain, HttpTransport, WalletClient as WalletClientViem } from 'viem';

export const ethNativeCurrency = { name: 'Ether', symbol: 'ETH', decimals: 18 };
export type WalletClient = WalletClientViem<HttpTransport, Chain, Account>;
