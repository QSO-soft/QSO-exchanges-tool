export const calculateBalance = (balance: string, decimal: number) =>
  parseFloat((parseInt(balance) / 10 ** decimal).toFixed(6));
