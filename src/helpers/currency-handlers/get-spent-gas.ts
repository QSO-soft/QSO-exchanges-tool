export const getSpentGas = (gasPrice: string, gasUsed: string) =>
  getSpentGasByFee(`${parseInt(gasPrice) * parseInt(gasUsed)}`);

export const getSpentGasByFee = (fee: string) => parseInt(fee) / Math.pow(10, 18);
