import dayjs from 'dayjs';

type Format = 'MM:DD' | 'DD:MM';
export const convertDateStringToISODate = (dateString: string, splitter: string = '.', format: Format = 'DD:MM') => {
  const [firstPart, secondPart, year] = dateString.split(splitter);

  if (firstPart && secondPart && year) {
    const isoDate = new Date(
      Number(year),
      Number(format === 'DD:MM' ? secondPart : firstPart) - 1,
      Number(format === 'DD:MM' ? firstPart : secondPart)
    ).toISOString();
    return isoDate.substring(0, 10);
  }

  return '';
};

export const timestampToDayjsDate = (timestamp: string | number) =>
  dayjs.unix(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp * 1000);

export const getDateDiff = (finishTime: string, unit: 'seconds' | 'minutes' | 'hours' = 'seconds') => {
  const currentDate = dayjs();

  const finishDate = dayjs(finishTime, 'DD-MM-YYYY HH:mm');

  return finishDate.diff(currentDate, unit);
};
