import CryptoJS from 'crypto-js';
import yargs from 'yargs';

const slicedArgv = process.argv.slice(2);
const argv = await yargs().demandCommand(1, 'Secret phrase are required').parse(slicedArgv);
const [secret] = argv._;

export const encryptKey = (originalKey: string) => CryptoJS.AES.encrypt(originalKey, `${secret}`).toString();

export const decryptKey = (encryptedKey: string) => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedKey, `${secret}`);

  return decryptedBytes.toString(CryptoJS.enc.Utf8);
};
