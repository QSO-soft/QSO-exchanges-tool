export function getUsdValue(value: bigint, usdPrice: number) {
  return (parseInt(value.toString()) / Math.pow(10, 18)) * usdPrice;
}
