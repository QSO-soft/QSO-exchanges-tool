import { buildFolderName } from '../../../logger/utils';
import { LOGGER_PATH } from '../constants';

export const buildLocalFolderName = () => buildFolderName(LOGGER_PATH);
