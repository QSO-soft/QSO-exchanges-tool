import path, { dirname, sep } from 'path';
import { fileURLToPath } from 'url';

export const _filename = fileURLToPath(import.meta.url);

export const _dirname = dirname(_filename);

export const INPUTS_CSV_FOLDER = path.resolve(_dirname, '../_inputs/csv');
export const INPUTS_JSON_FOLDER = path.resolve(_dirname, '../_inputs/json');
export const OUTPUTS_CSV_FOLDER = path.resolve(_dirname, '../_outputs/csv');
export const OUTPUTS_JSON_FOLDER = path.resolve(_dirname, '../_outputs/json');

export const SAVED_MODULES_FOLDER = `${OUTPUTS_JSON_FOLDER}${sep}saved-modules`;
export const MAILS_FOLDER = `${INPUTS_CSV_FOLDER}${sep}mails`;
export const INPUTS_INVITES_FOLDER = `${INPUTS_CSV_FOLDER}${sep}invites`;
export const OUTPUTS_INVITES_FOLDER = `${OUTPUTS_JSON_FOLDER}${sep}invites`;
export const CHECKERS_FOLDER = `${OUTPUTS_CSV_FOLDER}${sep}checkers`;
