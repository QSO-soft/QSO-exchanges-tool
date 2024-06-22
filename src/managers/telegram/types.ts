import type { LoggerData, LoggerType } from '../../logger';

export interface SendMessageProps {
  chatIds: number[];
  token: string;
  message: string;
}

export interface MsgToTGParams {
  message: string;
  type?: 'modulesInfo' | 'criticalErrors';
  logger?: LoggerType;
  logTemplate?: LoggerData;
}

export interface ChatDetails {
  message: {
    chat: {
      id: number;
    };
  };
}
