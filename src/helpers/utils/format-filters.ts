import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { And, IsNull, LessThan, MoreThan, MoreThanOrEqual, Or } from 'typeorm';

import { MoreOrLessString, MoreOrLessStringRange } from '../../types';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export const formatMoreOrLessFilter = (value: MoreOrLessString | MoreOrLessStringRange | null, field: string) => {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    const valueFrom = value[0];
    const numberPartFrom = +valueFrom.slice(1);

    const valueTo = value[1];
    const numberPartTo = +valueTo.slice(1);

    return {
      [field]: And(MoreThan(numberPartFrom), LessThan(numberPartTo)),
    };
  }

  const numberPart = +value.slice(1);
  if (value.startsWith('<')) {
    return {
      [field]: LessThan(numberPart),
    };
  }
  if (value.startsWith('>')) {
    return {
      [field]: MoreThan(numberPart),
    };
  }

  return;
};

export const formatHasThisMonthFilter = (value: boolean | null, dateField: string) => {
  if (value === null) {
    return {};
  }

  const startOfMonth = dayjs().startOf('month').utc().toDate();
  // const endOfMonth = dayjs().endOf('month').utc().endOf('day').toDate();

  if (value) {
    return {
      [dateField]: MoreThanOrEqual(startOfMonth),
    };
  }

  return {
    [dateField]: Or(LessThan(startOfMonth), IsNull()),
  };
};
