import crypto from 'crypto';

import random from 'lodash/random';
import sample from 'lodash/sample';

import { EMAIL_DOMAINS, RANDOM_WORDS } from '../../constants';
import { BigIntRange, NumberRange } from '../../types';

export const getRandomNumber = ([min, max]: NumberRange, isInteger: boolean = false) => random(min, max, !isInteger);

export const getRandomBigInt = ([min, max]: BigIntRange) => {
  return BigInt(getRandomNumber([Number(min), Number(max)]));
};

export const getRandomNumberRange = ([min, max]: NumberRange) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomEmail = () => {
  const username = Math.random().toString(36).substring(2, 12);

  const emailDomain = getRandomItemFromArray(EMAIL_DOMAINS);

  return `${username}@${emailDomain}`;
};

export const removePrefixZeroes = (address: string): string => {
  if (address[2] !== '0') return address;

  const updatedAddress = address.slice(0, 2) + address.slice(3);

  return removePrefixZeroes(updatedAddress);
};

export const generateRandomSentence = (wordsRange: NumberRange, words = RANDOM_WORDS) => {
  const randomSentenceLength = getRandomNumber(wordsRange);

  const randomWords = [];

  for (let i = 0; i < randomSentenceLength; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    randomWords.push(words[randomIndex]);
  }

  return randomWords.join(' ') + '.';
};

export const generateRandomNumber = () => {
  const maxNumber = BigInt(10) ** BigInt(12);
  const randomBytes = crypto.randomBytes(6);
  const randomNumber = BigInt('0x' + randomBytes.toString('hex')) % maxNumber;

  return randomNumber.toString().padStart(12, '0');
};

export const getRandomItemFromArray = <T>(array: T[]): T => sample(array) as T;
