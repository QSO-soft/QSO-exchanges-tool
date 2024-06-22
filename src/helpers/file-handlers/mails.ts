import { sep } from 'path';

import { MAILS_FOLDER, NO_MAIL_TO_USE } from '../../constants';
import { LoggerType } from '../../logger';
import { Mail } from '../../types';
import { getRandomItemFromArray } from '../utils';
import { convertAndWriteToJSON, convertToCsvAndWrite, DataForCsv } from './csv-converters';

const getMails = async (projectName: string) => {
  const inputPath = `${MAILS_FOLDER}${sep}${projectName}-mails.csv`;

  return (await convertAndWriteToJSON({
    inputPath,
  })) as Mail[];
};
export const getCurrentMailToUse = async (projectName: string) => {
  const mails = await getMails(projectName);
  const notUsedMails = mails.filter(({ used }) => !used);
  if (!notUsedMails.length) {
    throw new Error(NO_MAIL_TO_USE);
  }
  return getRandomItemFromArray(notUsedMails);
};

interface UpdateUsedMail {
  currentMailToUse: Mail;
  logger: LoggerType;
  walletId: string;
  projectName: string;
}
export const updateUsedMail = async ({ projectName, currentMailToUse, logger, walletId }: UpdateUsedMail) => {
  const fileName = `${projectName}-mails.csv`;
  const mails = await getMails(projectName);

  const updatedMails = mails.map(({ mail, used }) => {
    const isCurrentMail = mail === currentMailToUse.mail;

    if (isCurrentMail) {
      logger.info(`Wallet ${walletId} used ${currentMailToUse.mail} mail`);
    }

    return {
      mail,
      used: isCurrentMail ? true : used,
    };
  });
  convertToCsvAndWrite({
    data: updatedMails as unknown as DataForCsv,
    fileName,
    outputPath: MAILS_FOLDER,
  });
};
