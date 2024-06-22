import shuffle from 'lodash/shuffle';

export const shuffleArray = <T>(array: T[]): T[] => shuffle(array);
