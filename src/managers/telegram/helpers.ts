import axios from 'axios';

import { ResponseStatus } from '../../helpers';
import type { ChatDetails, SendMessageProps } from './types';

export const TG_BASE_URL = 'https://api.telegram.org/bot';

export const getTgChatIds = async (token: string) => {
  const url = `${TG_BASE_URL}${token}/getUpdates`;

  const response = await axios.get(url);
  const { ok: status = false, result = null } = response?.data || {};

  if (!status || !result || !result?.length) {
    throw new Error('TG API Error');
  }

  const uniqChatIds = new Set<number>();
  result.forEach((details: ChatDetails) => uniqChatIds.add(details.message.chat.id));

  return Array.from(uniqChatIds);
};

export const sendTgMessage = async ({ chatIds, token, message }: SendMessageProps) => {
  const url = `${TG_BASE_URL}${token}/sendMessage`;

  const requestPromises = chatIds.map(async (id) => {
    const params = {
      chat_id: id,
      text: message,
      parse_mode: 'MarkdownV2',
      link_preview_options: {
        is_disabled: true,
      },
    };
    return axios.post(url, params);
  });

  await Promise.all(requestPromises);
};

export const getTgMessageByStatus = (
  status: Exclude<ResponseStatus, 'passed'> = 'success',
  moduleName: string,
  message?: string,
  link?: {
    url: string;
    msg: string;
  }
) => {
  const mdMessage = transformMdMessage(
    message || link ? `[${moduleName}]:${message ? ' ' + message : ''}` : moduleName
  );

  const msgWithUrl = link ? mdMessage + ` ${message ? '\\| ' : ''}[${link.msg}](${link?.url})` : mdMessage;

  switch (status) {
    case 'success':
      return `✅ ${msgWithUrl}`;
    case 'warning':
      return `⚠️ ${msgWithUrl}`;
    case 'error':
      return `❌ ${msgWithUrl}`;
    case 'critical':
      return `💢 ${msgWithUrl}`;
  }
};

export const transformMdMessage = (msg: string): string => {
  const reservedSymbols = [
    '\\',
    '!',
    '+',
    '-',
    '_',
    '=',
    '#',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    '~',
    '*',
    '`',
    '|',
    '.',
    '>',
  ];

  let mdMessage = msg;
  for (const symbol of reservedSymbols) {
    mdMessage = mdMessage.replaceAll(symbol, '\\' + symbol);
  }

  return mdMessage;
};
