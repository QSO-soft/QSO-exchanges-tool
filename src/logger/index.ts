import path from 'path';

import winston from 'winston';

import { getDirname, msgToTemplateTransform } from '../helpers';
import { WalletData } from '../types';
import { COMBINED_LOGS, LEVELS_COLORS, LEVELS_NAMES, LOGS_PATH } from './constants';
import { initLogger } from './utils';

export interface LoggerData extends LoggerMeta {
  action?: string; // can be any module or exec function name
  txId?: number;
}

interface LoggerMeta {
  wallet?: WalletData;
  moduleName?: string;
}

declare module 'winston' {
  export interface Logger {
    success: winston.LeveledLogMethod;
  }
}

winston.addColors(LEVELS_COLORS);

export class Logger {
  private readonly logger;
  private logsPath: string;
  private fileName: string;
  meta: LoggerMeta;

  constructor(logsPath?: string, fileName?: string) {
    this.logger = initLogger();
    this.logsPath = logsPath || LOGS_PATH;
    this.fileName = fileName || COMBINED_LOGS;
    this.meta = { moduleName: '' };
  }

  private buildPath() {
    const dirname = getDirname();

    return path.join(dirname, this.logsPath, this.fileName);
  }
  private buildTemplate(msg: string, templateData?: LoggerData) {
    return msgToTemplateTransform(msg, {
      id: templateData?.wallet?.id || this.meta.wallet?.id,
      address: templateData?.wallet?.walletAddress || this.meta.wallet?.walletAddress,
      moduleName: this.meta.moduleName,
      ...templateData,
    });
  }

  private isTransportExists(transportFileName: string): boolean {
    return this.logger.transports.some((transport) => {
      if (transport instanceof winston.transports.File) {
        return transport.filename === transportFileName;
      }
      return false;
    });
  }

  private addTransport(level: string = 'info') {
    const transportFile = new winston.transports.File({
      filename: this.buildPath(),
      level,
    });

    if (this.isTransportExists(transportFile.filename)) {
      console.error('Transport with the same filename already exists. Aborting.');
      return null;
    }

    this.logger.add(transportFile);

    return transportFile;
  }

  private removeTransport(transportFile: winston.transports.FileTransportInstance) {
    const hasTransport = this.logger.transports.indexOf(transportFile) !== -1;

    if (hasTransport) {
      this.logger.remove(transportFile);
    }
  }

  setLoggerMeta(meta: LoggerMeta) {
    this.meta = { ...this.meta, ...meta };
  }

  successDisplay(msg: string, templateData?: LoggerData) {
    this.logger.success(this.buildTemplate(msg, templateData));
  }

  infoDisplay(msg: string, templateData?: LoggerData) {
    this.logger.info(this.buildTemplate(msg, templateData));
  }

  warningDisplay(msg: string, templateData?: LoggerData) {
    this.logger.warning(this.buildTemplate(msg, templateData));
  }

  errorDisplay(msg: string, templateData?: LoggerData) {
    this.logger.error(this.buildTemplate(msg, templateData));
  }

  success(msg: string, templateData?: LoggerData) {
    const transportFile = this.addTransport(LEVELS_NAMES.success);
    if (transportFile) {
      this.successDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  info(msg: string, templateData?: LoggerData) {
    const transportFile = this.addTransport();
    if (transportFile) {
      this.infoDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  warning(msg: string, templateData?: LoggerData) {
    const transportFile = this.addTransport(LEVELS_NAMES.warning);
    if (transportFile) {
      this.warningDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }

  error(msg: string, templateData?: LoggerData) {
    const transportFile = this.addTransport(LEVELS_NAMES.error);
    if (transportFile) {
      this.errorDisplay(msg, templateData);
      this.removeTransport(transportFile);
    }
  }
}

export type LoggerType = Logger;
export default new Logger();
