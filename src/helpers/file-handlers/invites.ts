import { sep } from 'path';

import { INPUTS_INVITES_FOLDER } from '../../constants';
import { LoggerType } from '../../logger';
import { Invite } from '../../types';
import { getRandomItemFromArray } from '../utils';
import { convertAndWriteToJSON, convertToCsvAndWrite, DataForCsv } from './csv-converters';

interface SavePreparedInvites {
  projectName: string;
  availableInvitesAmount: number;
}
export const savePreparedInvites = async ({ projectName, availableInvitesAmount }: SavePreparedInvites) => {
  const fileName = `${projectName}-invites.csv`;

  const invites = (await convertAndWriteToJSON({
    inputPath: `${INPUTS_INVITES_FOLDER}${sep}${fileName}`,
  })) as Invite[];

  const invitesToUse: Invite[] = invites.map(({ invite_code, used }) => {
    return {
      invite_code,
      used: typeof used !== 'undefined' ? used : availableInvitesAmount,
    };
  });

  convertToCsvAndWrite({
    data: invitesToUse as unknown as DataForCsv,
    fileName: fileName,
    outputPath: INPUTS_INVITES_FOLDER,
  });
  // await printResultsAsync<Invite[]>({
  //   data: invitesToUse,
  //   fileName: `${projectName}-invites.json`,
  //   outputPath: INPUTS_INVITES_FOLDER,
  //   withAppend: true,
  //   transformDataCallback: (prevInvites) => {
  //     let dataToSave: Invite[] = [];
  //
  //     const newInvitesFromCSV = invites.filter(
  //       ({ invite_code }) => !prevInvites.some(({ invite_code: savedInviteCode }) => savedInviteCode === invite_code)
  //     );
  //
  //     dataToSave = [...prevInvites, ...newInvitesFromCSV].map(({ invite_code, used }) => {
  //       return {
  //         invite_code,
  //         used: typeof used !== 'undefined' ? used : availableInvitesAmount,
  //       };
  //     });
  //
  //     invitesToUse = dataToSave;
  //     return dataToSave;
  //   },
  // });
};

export const getCurrentInvite = (invites: Invite[]) => {
  const notUsedInvites = invites.filter(({ used }) => !!used);

  return getRandomItemFromArray(notUsedInvites);
};

interface SaveUsedInvites {
  projectName: string;
  logger: LoggerType;
  walletId: string;
  invites: Invite[];
  currentInviteToUse?: Invite;
}
export const saveUsedInvites = ({ invites, projectName, walletId, logger, currentInviteToUse }: SaveUsedInvites) => {
  if (currentInviteToUse) {
    logger.info(`Wallet ${walletId} used ${currentInviteToUse.invite_code} invite code`);
    const fileName = `${projectName}-invites.csv`;

    const updatedInvites = invites.map(({ invite_code, used }) => {
      const isCurrentInvite = currentInviteToUse?.invite_code === invite_code && !!used;

      if (isCurrentInvite) {
        return { invite_code, used: used - 1 };
      }

      return { invite_code, used };
    });

    convertToCsvAndWrite({
      data: updatedInvites as unknown as DataForCsv,
      fileName: fileName,
      outputPath: INPUTS_INVITES_FOLDER,
    });
    // await printResultsAsync<Invite[]>({
    //   data: [],
    //   fileName: `${projectName}-invites.json`,
    //   outputPath: OUTPUTS_INVITES_FOLDER,
    //   withAppend: true,
    //   transformDataCallback: (prevInvites) => {
    //     return prevInvites.map(({ invite_code, used }) => {
    //       const isCurrentInvite = currentInviteToUse?.invite_code === invite_code && !!used;
    //
    //       if (isCurrentInvite) {
    //         return { invite_code, used: used - 1 };
    //       }
    //
    //       return { invite_code, used };
    //     });
    //   },
    // });
  }
};

interface AddInviteCode {
  projectName: string;
  inviteCode: string;
}
export const addInviteCode = async ({ projectName, inviteCode }: AddInviteCode) => {
  const fileName = `${projectName}-invites.csv`;

  const prevData = await convertAndWriteToJSON({
    inputPath: `${INPUTS_INVITES_FOLDER}${sep}${fileName}`,
  });

  const filteredPrevData = prevData.filter((currentData) => {
    return 'invite_code' in currentData && currentData?.invite_code !== inviteCode;
  });

  const inviteCodeIsAlreadyExists = prevData.some(
    (currentData) => 'invite_code' in currentData && currentData?.invite_code === inviteCode
  );

  if (!inviteCodeIsAlreadyExists) {
    convertToCsvAndWrite({
      data: [...filteredPrevData, { invite_code: inviteCode }] as DataForCsv,
      fileName,
      outputPath: INPUTS_INVITES_FOLDER,
    });
  }
};

export const readInvites = async (projectName: string) => {
  return (await convertAndWriteToJSON({
    inputPath: `${INPUTS_INVITES_FOLDER}${sep}${projectName}-invites.csv`,
  })) as Invite[];
};
