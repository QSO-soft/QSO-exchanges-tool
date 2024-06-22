import { TELEGRAM } from '../../_inputs/settings';
import { msgToTemplateTransform } from '../../helpers';
import { getTgChatIds, sendTgMessage } from './helpers';
import type { MsgToTGParams } from './types';

export const sendMsgToTG = async ({ message, logger, logTemplate, type = 'modulesInfo' }: MsgToTGParams) => {
  try {
    const { token, IDs } = TELEGRAM;

    const tgToken = token[type];
    const tgIDs = IDs[type];

    let chatIds: number[] = tgIDs;

    if (!tgToken) {
      return;
    }

    if (!chatIds?.length) {
      chatIds = await getTgChatIds(tgToken);
      logger?.success(`We retrieved next chat IDs: ${JSON.stringify(chatIds)}`, {
        moduleName: 'Telegram',
        action: 'sendMsgToTG',
      });
    }

    const msg = msgToTemplateTransform(message, logTemplate);
    await sendTgMessage({ message: msg, chatIds, token: tgToken });
  } catch (error) {
    const e = error as Error;
    logger?.error(`Error while sending alert to TG: ${e.message}`, logTemplate);

    return;
  }
};
