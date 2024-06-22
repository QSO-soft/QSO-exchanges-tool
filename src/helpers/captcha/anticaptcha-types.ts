import { LoggerType } from '../../logger';
import { ProxyObject } from '../../types';

// ARGS =================================================
interface BaseGetAnticaptchaArgs {
  taskType: CaptchaTaskType;
  websiteURL: string;
  logger?: LoggerType;
  proxyObject?: ProxyObject;
}
interface RecaptchaArgs {
  websiteKey: string;
  isEnterprise?: boolean;
  minScore?: number;
  pageAction?: string;
}
interface ImageToTextArgs {
  body: string;
}
interface ImageToCoordinatesArgs {
  body: string;
  comment?: string;
  mode?: 'points' | 'rectangles';
}
interface FunCaptchaArgs {
  websitePublicKey: string;
}
interface GeeTestArgs {
  gt: string;
  challenge: string;
  version?: 3 | 4;
}
interface HCaptchaArgs {
  websiteKey: string;
  isEnterprise?: boolean;
  isInvisible?: boolean;
}
interface TurnstileArgs {
  websiteKey: string;
  action?: string;
  cData?: string;
}

type Options =
  | RecaptchaArgs
  | ImageToCoordinatesArgs
  | GeeTestArgs
  | HCaptchaArgs
  | TurnstileArgs
  | FunCaptchaArgs
  | ImageToTextArgs;

export type GetAnticaptchaArgs = BaseGetAnticaptchaArgs & {
  options: Options;
};

// RES =================================================
export type BaseCaptchaRes = {
  token: string;
};
export type RecaptchaRes = {
  gRecaptchaResponse: string;
};
export interface ImageToTextRes {
  text: string;
  url: string;
}
export interface ImageToCoordinatesRes {
  coordinates: string;
}
export interface GeeTestV3Res {
  challenge: string;
  validate: string;
  seccode: string;
}
export interface GeeTestV4Res {
  captcha_id: string;
  lot_number: string;
  pass_token: string;
  gen_time: string;
  captcha_output: string;
}
export interface HCaptchaRes {
  token: string;
  respKey?: string;
}

export interface CreateAnticaptchaRes {
  errorId: number;
  taskId: number;
  errorDescription?: string;
}
export type Solution =
  | RecaptchaRes
  | ImageToTextRes
  | ImageToCoordinatesRes
  | GeeTestV3Res
  | GeeTestV4Res
  | HCaptchaRes
  | BaseCaptchaRes;
export interface GetAnticaptchaResultRes<CurrentSolution extends Solution> {
  errorId: number;
  status: string;
  solution?: CurrentSolution;
  errorDescription?: string;
}

// TASKS =================================================
export type RecaptchaTaskType =
  | 'RecaptchaV2Task'
  | 'RecaptchaV2TaskProxyless'
  | 'RecaptchaV3TaskProxyless'
  | 'RecaptchaV2EnterpriseTask'
  | 'RecaptchaV2EnterpriseTaskProxyless'
  | 'RecaptchaV3EnterpriseProxyless';
export type FunCaptchaTaskType = 'FunCaptchaTask' | 'FunCaptchaTaskProxyless';
export type GeeTestTaskType = 'GeeTestTask' | 'GeeTestTaskProxyless';
export type HCaptchaTaskType = 'HCaptchaTask' | 'HCaptchaTaskProxyless';
export type TurnstileTaskType = 'TurnstileTask' | 'TurnstileTaskProxyless';
export type ImageCaptchaTaskType = 'ImageToCoordinatesTask' | 'ImageToTextTask';
export type CaptchaTaskType =
  | RecaptchaTaskType
  | FunCaptchaTaskType
  | GeeTestTaskType
  | HCaptchaTaskType
  | TurnstileTaskType
  | ImageCaptchaTaskType;

// GUARDS =================================================
export const isRecaptchaTask = (taskType: CaptchaTaskType): taskType is RecaptchaTaskType =>
  taskType.startsWith('Recaptcha');
export const isImageToTextCaptchaTask = (taskType: CaptchaTaskType): taskType is ImageCaptchaTaskType =>
  taskType === 'ImageToTextTask';
export const isImageToCoordsCaptchaTask = (taskType: CaptchaTaskType): taskType is ImageCaptchaTaskType =>
  taskType === 'ImageToCoordinatesTask';

export const isGeeTestTask = (taskType: CaptchaTaskType): taskType is GeeTestTaskType => taskType.startsWith('GeeTest');

export const isHCaptchaTask = (taskType: CaptchaTaskType): taskType is HCaptchaTaskType =>
  taskType.startsWith('HCaptcha');

export const isTurnstileTask = (taskType: CaptchaTaskType): taskType is TurnstileTaskType =>
  taskType.startsWith('Turnstile');

export const isFunCaptchaTask = (taskType: CaptchaTaskType): taskType is FunCaptchaTaskType =>
  taskType.startsWith('FunCaptcha');
