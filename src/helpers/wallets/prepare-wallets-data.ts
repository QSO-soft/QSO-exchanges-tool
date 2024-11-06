import { sep } from 'path';

import { INPUTS_CSV_FOLDER, NUMBER_ONLY_REGEXP, OUTPUTS_JSON_FOLDER } from '../../constants';
import { LoggerData } from '../../logger';
import { WalletData } from '../../types';
import { decryptKey, encryptKey } from '../cryptography-handlers';
import { convertAndWriteToJSON, convertToCSV, DataForCsv, printResults } from '../file-handlers';
import { getFileNameWithPrefix } from '../msg-to-template';
import { initLocalLogger } from '../show-logs';
import { PrepareFromCsvArgs, PrepareRowFromCsvArgs, PrepareWalletsData } from './types';

const PRIV_KEY_LENGTH = 70;

export const formatId = (inputString: string, index: number): string => {
  const parts: string[] = (inputString || `${index} ID`).split(NUMBER_ONLY_REGEXP);

  const isNumberPartCorrect = !isNaN(Number(parts[0]));
  const isPartsSplittedCorrectly = parts.length >= 1 && isNumberPartCorrect;

  if (isPartsSplittedCorrectly) {
    const numberPart: number = Number(parts[0]);
    const formattedNumberPart: string = numberPart.toString().padStart(4, '0');
    const namePart = parts.slice(1).join('').trim();

    return `${formattedNumberPart}${namePart ? ' ' + namePart : ''}`;
  }

  return '';
};

export const prepareRowFromCSV = ({ walletData, logger, client, index }: PrepareRowFromCsvArgs) => {
  const { id, privKey, mnemonic, ...restRow } = walletData;

  let decryptedPrivKey = privKey;
  // PrivKey already was encrypted last time and we need to decrypt that to get wallet address
  if (privKey && privKey.length > PRIV_KEY_LENGTH) {
    decryptedPrivKey = decryptKey(privKey);
  }

  let decryptedMnemonic = mnemonic;
  // Mnemonic already was encrypted last time and we need to decrypt that to get wallet address
  if (mnemonic && mnemonic.split(' ').length <= 1) {
    decryptedMnemonic = decryptKey(mnemonic);
  }

  const walletAddress =
    new client(logger, {
      ...walletData,
      privKey: decryptedPrivKey,
      mnemonic: decryptedMnemonic,
    }).getWalletAddress() || walletData.walletAddress;

  return {
    ...restRow,
    privKey,
    mnemonic,
    id: formatId(id, index),
    walletAddress,
  };
};

export const prepareFromCsv = async ({ logger, projectName, client }: PrepareFromCsvArgs) => {
  const fileName = getFileNameWithPrefix(projectName, 'wallets');
  const logTemplate: LoggerData = {
    action: 'prepareFromCsv',
  };

  try {
    logger.info(`Preparing data from ${fileName}.csv...`, logTemplate);

    const inputName = `${fileName}.csv`;
    const inputPath = `${INPUTS_CSV_FOLDER}${sep}${inputName}`;
    const outputName = `${fileName}.json`;
    const outputPath = `${OUTPUTS_JSON_FOLDER}${sep}${outputName}`;

    const data = (await convertAndWriteToJSON({
      inputPath,
      outputPath,
      logger,
      withSaving: true,
    })) as WalletData[];

    const dataToSave: WalletData[] = data.map((walletData, index) =>
      prepareRowFromCSV({ client, walletData, logger, index })
    );

    const idOrPrivKeyIsEmpty = dataToSave.some(({ walletAddress }) => !walletAddress);

    if (idOrPrivKeyIsEmpty) {
      logger.error('Unable to reate rows, some walletAddress in wallets.csv is empty', {
        ...logTemplate,
      });

      return;
    }

    if (dataToSave.length !== data.length) {
      logger.error('Unable to prepare all data correctly', {
        ...logTemplate,
      });

      return;
    }

    const dataToSaveInCsv: WalletData[] = dataToSave.map(({ id, walletAddress, privKey, mnemonic, ...rest }) => {
      let encryptedPrivKey = privKey;
      // We need to encrypt privKey to push into csv and json
      if (privKey && privKey.length <= PRIV_KEY_LENGTH) {
        encryptedPrivKey = encryptKey(privKey);
      }

      let encryptedMnemonic = mnemonic;
      // We need to encrypt mnemonic to push into csv and json
      if (mnemonic && mnemonic.split(' ').length > 1) {
        encryptedMnemonic = encryptKey(mnemonic);
      }

      return {
        id,
        walletAddress,
        privKey: encryptedPrivKey,
        mnemonic: encryptedMnemonic,
        ...rest,
      };
    });

    const dataToSaveInJson = dataToSaveInCsv.map((data, index) => ({
      ...data,
      index,
    }));
    const stringifiedDataForJson = JSON.stringify(dataToSaveInJson, null, 2);
    printResults({ data: stringifiedDataForJson, fileName: outputName, outputPath: OUTPUTS_JSON_FOLDER });

    if (dataToSaveInCsv.length) {
      const csvStringData = convertToCSV(dataToSaveInCsv as unknown as DataForCsv);
      printResults({ data: csvStringData, fileName: inputName, outputPath: INPUTS_CSV_FOLDER });
    }

    return dataToSaveInJson;
  } catch (err) {
    const e = err as Error;
    let errorMessage = e.message;

    if (
      errorMessage.includes('private key must be 32 bytes, hex or bigint') ||
      errorMessage.includes('Malformed UTF-8 data')
    ) {
      errorMessage = 'Some private key or secret phrase is wrong';
    }

    logger.error(`Unable to prepare data from CSV: \n${errorMessage}`, {
      ...logTemplate,
    });
  }

  return;
};

export const prepareWalletsData = async ({
  logsFolderName,
  ...restProps
}: PrepareWalletsData): Promise<WalletData[]> => {
  const logger = initLocalLogger(logsFolderName, 'prepare-wallets-data');
  logger.setLoggerMeta({ moduleName: 'PrepareWalletsData' });
  const logTemplate: LoggerData = {
    action: 'prepareWalletsData',
  };

  try {
    return (
      (await prepareFromCsv({
        logger,
        ...restProps,
      })) || []
    );
  } catch (err) {
    logger.error('Unable to prepare wallets data', { ...logTemplate });
  }
  return [];
};
