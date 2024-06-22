import axios from 'axios';

import { CAPMONSTER_CAPTCHA_KEY } from '../../_inputs/settings';
import { ProxyObject, StringRecord } from '../../types';
import { getHeaders, sleep } from '../utils';

const CAPMONSTER_API_URL = 'https://api.anti-captcha.com';

// TODO: update later ?
interface GetCapmonsterCaptcha {
  taskType: null;
  websiteURL: string;
  websiteKey: string;
  proxyObject?: ProxyObject;
}

const getTaskResult = async (taskId: number, headers: StringRecord) => {
  const { data } = await axios.post(
    `${CAPMONSTER_API_URL}/getTaskResult`,
    {
      clientKey: CAPMONSTER_CAPTCHA_KEY,
      taskId,
    },
    {
      headers,
    }
  );

  return data;
};
export const getCapmonsterCaptcha = async ({ proxyObject, taskType, websiteKey, websiteURL }: GetCapmonsterCaptcha) => {
  try {
    let proxyAgentObject = {};
    if (proxyObject) {
      const { proxyType, proxyLogin, proxyPort, proxyIp, proxyPass } = proxyObject;
      proxyAgentObject = {
        proxyType: proxyType.toLowerCase(),
        proxyPort,
        proxyLogin,
        proxyAddress: proxyIp,
        proxyPassword: proxyPass,
      };
    }

    const headers = getHeaders();
    const { data: createdTaskData } = await axios.post(
      `${CAPMONSTER_API_URL}/createTask`,
      {
        clientKey: CAPMONSTER_CAPTCHA_KEY,
        task: {
          type: taskType,
          websiteURL,
          websiteKey,
          minScore: 0.7,
          isEnterprise: true,
          ...proxyAgentObject,
        },
      },
      { headers }
    );

    if (createdTaskData.errorDescription) {
      throw new Error(createdTaskData.errorDescription);
    }

    let resultData = await getTaskResult(createdTaskData.taskId, headers);

    while (resultData.status === 'processing') {
      await sleep(10);
      resultData = await getTaskResult(createdTaskData.taskId, headers);
    }

    if (resultData.errorDescription) {
      throw new Error(resultData.errorDescription);
    }

    return resultData.solution?.gRecaptchaResponse;
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message);
  }
};
