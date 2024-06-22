import crypto from 'crypto';

export const hashString = (string: string) => crypto.createHash('sha256').update(string).digest('hex');

export const encodeString = (string: string) => {
  if (!string) return '';

  const encodedSymbols = ['0x'];

  for (let symbolIndex = 0; symbolIndex < string.length; symbolIndex++)
    encodedSymbols.push(string.charCodeAt(symbolIndex).toString(16));

  return encodedSymbols.join('');
};

export const getEncodedString = (string: string) => {
  const hashedString = hashString(string);

  return encodeString(hashedString).substring(0, 65);
};
