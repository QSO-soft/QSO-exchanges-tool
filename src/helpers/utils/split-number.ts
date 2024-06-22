import { getRandomNumber } from './randomizers';

interface SplitPercents {
  count: number;
  amount: number;
  isPercents: boolean;
}
export const splitPercents = ({ count, amount, isPercents }: SplitPercents): number[] => {
  const values = [];

  let updatedAmount = amount;
  for (let i = 0; i < count - 1; i++) {
    const num = i + 1;

    const minPercent = 20;
    const min = isPercents ? minPercent : updatedAmount * (minPercent / 100);
    const max = num * (min / count) + min * 2;

    const value = getRandomNumber([min, max], isPercents);
    updatedAmount = updatedAmount - value;
    values.push(value);
  }
  values.push(isPercents ? 100 : updatedAmount);

  return values;
};
