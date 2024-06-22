import { sep } from 'path';

import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { BASE_TIMEOUT, INPUTS_CSV_FOLDER } from '../../constants';
import { LoggerType } from '../../logger';
import { OptionalPreparedProxyData, OptionalProxyObject, PreparedProxyData, ProxyAgent } from '../../types';
import { convertAndWriteToJSON } from '../file-handlers';
import { getAxiosConfig } from './get-axios-config';
import { getRandomItemFromArray } from './randomizers';

export const MY_IP_API_URL = 'https://api.myip.com';

export const createProxyAgent = (proxy = '', logger?: LoggerType): ProxyAgent | null => {
  try {
    let proxyAgent = null;

    if (proxy) {
      if (proxy.includes('http')) {
        proxyAgent = new HttpsProxyAgent(proxy);
      }

      if (proxy.includes('socks')) {
        proxyAgent = new SocksProxyAgent(proxy);
      }
    }

    return proxyAgent;
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid URL')) {
      logger?.error('You use incorrect proxy format, it should be login:pass@ip:port');
    } else {
      const error = err as Error;
      logger?.error(`Unable to create proxy agent: ${error.message}`);
    }
  }

  return null;
};

export const getRandomProxy = async (logger?: LoggerType) => {
  const inputPath = `${INPUTS_CSV_FOLDER}${sep}proxies.csv`;

  const proxies = (await convertAndWriteToJSON({
    inputPath,
    logger,
  })) as { proxy: string }[];

  const randomProxy = getRandomItemFromArray(proxies);

  if (randomProxy) {
    return prepareProxy(randomProxy.proxy);
  }

  return;
};

export const prepareProxy = (proxy: string, logger?: LoggerType): OptionalPreparedProxyData => {
  try {
    const urlPattern = /^(socks5|http|https):\/\/([^:]+):([^@]+)@([^:]+):(\d+)$/i;
    const match = proxy.match(urlPattern);

    if (!match) {
      logger?.error('Invalid proxy URL format');
      return;
    }

    const [, type, login, pass, ip, port] = match;

    if (!type || !login || !pass || !ip || !port) {
      logger?.error('Invalid proxy URL format');
      return;
    }

    return {
      url: proxy,
      proxyType: type.toUpperCase(),
      proxyIp: ip,
      proxyPort: port,
      proxyLogin: login,
      proxyPass: pass,
    };
  } catch (err) {
    const error = err as Error;
    logger?.error(`Unable to prepare proxy: ${error.message}`);
    return;
  }
};

export const prepareProxyAgent = async (
  proxyData: PreparedProxyData,
  updateProxyLink?: string,
  logger?: LoggerType
): Promise<OptionalProxyObject> => {
  const { url, ...restProxyData } = proxyData;

  const proxyAgent = createProxyAgent(url, logger);

  if (proxyAgent) {
    const config = await getAxiosConfig({
      proxyAgent,
    });

    if (updateProxyLink) {
      try {
        await axios.get(updateProxyLink, {
          ...config,
          headers: {
            'Content-Type': 'text/html',
            Accept: 'text/html',
            Connection: 'Keep-Alive',
          },
          timeout: BASE_TIMEOUT,
        });
      } catch (err) {
        const errMsg = (err as Error).message;

        const errPrefix = 'Unable to update proxy ip: ';
        if (errMsg.includes('socket hang up')) {
          logger?.error(errPrefix + 'Please try to remove port from updateProxyLink domain');
        } else if (errMsg.includes('self-signed certificate')) {
          logger?.error(errPrefix + 'Please try to change protocol from https to http');
        } else {
          logger?.error(errPrefix + errMsg);
        }
      }
    }

    // show current IP address
    if (logger) {
      try {
        const response = await axios.get(MY_IP_API_URL, config);

        const data = response?.data;

        if (data && !data.error) {
          logger.info(`Current IP: ${data?.ip} | ${data?.country}`);
        } else {
          logger?.warning(`Unable to check current IP: ${data?.error}. Dont worry, proxy is still in use`);
        }
      } catch (err) {
        const error = err as Error;
        logger?.warning(`Unable to check current IP: ${error.message}. Dont worry, proxy is still in use`);
      }
    }

    return {
      proxyAgent,
      ...restProxyData,
    };
  }

  return null;
};

export const getProxyAgent = async (
  proxy: string,
  updateProxyLink?: string,
  logger?: LoggerType
): Promise<OptionalProxyObject> => {
  const preparedProxyData = prepareProxy(proxy, logger);

  if (preparedProxyData) {
    return prepareProxyAgent(preparedProxyData, updateProxyLink, logger);
  }

  return null;
};

export const createRandomProxyAgent = async (
  updateProxyLink?: string,
  logger?: LoggerType
): Promise<OptionalProxyObject> => {
  const proxy = await getRandomProxy();

  if (proxy) {
    return prepareProxyAgent(proxy, updateProxyLink, logger);
  }

  return null;
};
