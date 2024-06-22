export const checkMultipleOf = (value: number, multiplier: number) => {
  return multiplier % value === 0 && value !== 0 && multiplier !== 0;
};
