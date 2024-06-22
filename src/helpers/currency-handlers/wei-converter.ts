import { formatUnits, parseUnits } from 'viem';

export const ETH_DECIMAL = 18;

interface IntToDecimal {
  amount: number;
  decimals?: number;
}
export const intToDecimal = ({ amount, decimals = ETH_DECIMAL }: IntToDecimal) => {
  return parseUnits(amount.toString(), decimals);
};

interface DecimalToInt {
  amount: bigint;
  decimals?: number;
}
export const decimalToInt = ({ amount, decimals = ETH_DECIMAL }: DecimalToInt) => {
  return Number(formatUnits(amount, decimals));
};
