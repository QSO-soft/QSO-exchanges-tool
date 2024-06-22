import { Hex } from 'viem';

export interface GetTxs {
  walletAddress: string;
  chainId: number;
}

export interface GetTx {
  txHash: Hex;
  chainId: number;
}

export interface MoralisTx {
  hash: string;
  nonce: string;
  transaction_index: string;
  from_address: string;
  from_address_label?: string | null | undefined;
  to_address: string;
  to_address_label?: string | null | undefined;
  value: string;
  gas: string;
  gas_price: string;
  input: string;
  receipt_cumulative_gas_used: string;
  receipt_gas_used: string;
  receipt_contract_address: string;
  receipt_root: string;
  receipt_status: string;
  block_timestamp: string;
  block_number: string;
  block_hash: string;
  internal_transactions?: {
    transaction_hash: string;
    block_number: string;
    block_hash: string;
    type: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gas_used: string;
    input: string;
    output: string;
  };
}

export interface GetTxData {
  method: string;
  to: Hex;
  txs: MoralisTx[];
}
