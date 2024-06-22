import { StringRecord } from '../../types';
import { getRandomItemFromArray, getRandomNumber } from './randomizers';

const POSSIBLE_LANGUAGES = [
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de-AT',
  'de-CH',
  'de-DE',
  'de-LI',
  'de-LU',
  'el-GR',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-US',
  'es-ES',
  'fr-CA',
  'fr-CH',
  'fr-FR',
  'fr-LU',
  'it-CH',
  'it-IT',
  'ja-JP',
  'pl-PL',
  'ru-RU',
  'uk-UA',
];
export const getRandomLanguages = () => {
  const languagesCount = getRandomNumber([1, 3], true);

  const languages = [];
  let possibleLanguages = POSSIBLE_LANGUAGES;

  for (let i = 0; i < languagesCount; i++) {
    const randomLanguage = getRandomItemFromArray(possibleLanguages);
    possibleLanguages = possibleLanguages.filter((language) => language === randomLanguage);

    languages.push(randomLanguage);
  }

  return languages.map((language, index) => {
    const quality = 1 - (index + 1) / 10;

    return `${language},${language.split('-')[0]};q=${quality}`;
  });
};

const MOBILE_OS_LIST = ['iOS', 'Android'];
const DESKTOP_OS_LIST = ['Linux', 'macOS', 'Windows'];

const DESKTOP_BROWSER_LIST = ['Chrome', 'Firefox'];
const MOBILE_BROWSER_LIST = ['Chrome'];
const DESKTOP_APPLE_BROWSER_LIST = [...DESKTOP_BROWSER_LIST, 'Safari'];
const MOBILE_APPLE_BROWSER_LIST = [...MOBILE_BROWSER_LIST, 'Mobile Safari'];

const getRandomBrowser = (isMobile: boolean, isApple: boolean) => {
  return isMobile
    ? getRandomItemFromArray(isApple ? MOBILE_APPLE_BROWSER_LIST : MOBILE_BROWSER_LIST)
    : getRandomItemFromArray(isApple ? DESKTOP_APPLE_BROWSER_LIST : DESKTOP_BROWSER_LIST);
};
const getRandomOS = (isMobile: boolean) => {
  return isMobile ? getRandomItemFromArray(MOBILE_OS_LIST) : getRandomItemFromArray(DESKTOP_OS_LIST);
};

const WINDOWS_VERSIONS = ['10.0', '10.0.22000'];
const MACOS_VERSIONS = ['10_15_7', '11_7_10', '12_7_3', '13_6_4', '14_3_1'];
const ANDROID_VERSIONS = ['11', '12', '12.1', '13', '14'];
const ANDROID_DEVICES = [
  'SM-N980F',
  'SM-N9810',
  'SM-N986U1',
  'SM-N985F',
  'SM-S911U',
  'SM-S711U',
  'SM-S918B',
  'SM-S916U',
  'SM-F700N',
  'SM-F711U',
  'SM-F721B',
  'SM-F731U1',
  'SM-F707B',
  'SM-F9160',
  'SM-F926B',
  'SM-F936U',
  'SM-F900W',
  'Pixel 8',
  'Pixel 8 Pro',
  'Pixel Fold Build/UQ1A.231205.015; wv',
];
const IOS_VERSIONS = ['17.3.1', '16.7.5', '15.8.1'];
const APPLE_WEBKIT_VERSIONS = ['537.36', '605.1.15', '604.1', '600.1.4'];
const CHROME_VERSIONS = [
  '123.0.6286.0',
  '123.0.6285.0',
  '121.0.6167.159',
  '122.0.6261.27',
  '121.0.6167.171',
  '122.0.6261.29',
  '120.0.0.0',
  '120.0.6099.272',
];
const SAFARI_VERSIONS = ['17.0', '16.6.1'];
const FIREFOX_VERSIONS = ['122.0.1', '121.0.1', '120.0.1'];
const LINUX_VERSIONS = [
  '22.04.3',
  '22.04.2',
  '22.04.1',
  '22.04',
  '20.04.6',
  '20.04.5',
  '20.04.4',
  '20.04.3',
  '20.04.2',
  '20.04.1',
  '20.04',
];

interface GetRandomUserAgent {
  language: string;
  os: string;
  browser: string;
  isMobile: boolean;
}
const getOsConfig = ({ language, os }: GetRandomUserAgent) => {
  switch (os) {
    case 'Windows': {
      const windowsVersion = getRandomItemFromArray(WINDOWS_VERSIONS);
      return getRandomItemFromArray([
        `Windows; U; Windows NT ${windowsVersion}; ${language}`,
        `Windows NT ${windowsVersion}`,
        `Windows NT ${windowsVersion}; Win64; x64`,
        `Windows NT ${windowsVersion}; WOW64`,
      ]);
    }
    case 'macOS': {
      const macosVersion = getRandomItemFromArray(MACOS_VERSIONS);
      return getRandomItemFromArray([
        `Macintosh; U; Intel Mac OS X ${macosVersion}; ${language}`,
        `Macintosh; U; Intel Mac OS X ${macosVersion}`,
      ]);
    }
    case 'Linux': {
      return getRandomItemFromArray([
        `X11; U; Linux i686; ${language}`,
        `X11; U; Linux x86_64; ${language}`,
        'X11; Linux x86_64',
        'X11; Linux i686',
        'X11; Fedora; Linux x86_64',
        'X11; Linux i686 (x86_64)',
      ]);
    }
    case 'Android': {
      const androidVersion = getRandomItemFromArray(ANDROID_VERSIONS);
      const androidDevice = getRandomItemFromArray(ANDROID_DEVICES);

      return getRandomItemFromArray([`Linux; Android ${androidVersion}; ${androidDevice}`]);
    }
    case 'iOS': {
      const iosVersion = getRandomItemFromArray(IOS_VERSIONS);

      return getRandomItemFromArray([
        `iPad; CPU OS ${iosVersion} like Mac OS X`,
        `iPhone; U; CPU iPhone OS ${iosVersion} like Mac OS X`,
        `iPad; CPU OS ${iosVersion} like Mac OS X; ${language}`,
        `iPhone; U; CPU iPhone OS ${iosVersion} like Mac OS X; ${language}`,
      ]);
    }
    default:
      return '';
  }
};
const getBrowserConfig = ({ os, browser, isMobile }: GetRandomUserAgent, firefoxVersion: string) => {
  const isLinux = os === 'Linux';

  switch (browser) {
    case 'Chrome': {
      const appleWebKitVersion = getRandomItemFromArray(APPLE_WEBKIT_VERSIONS);
      const chromeVersion = getRandomItemFromArray(CHROME_VERSIONS);

      return `AppleWebKit/${appleWebKitVersion} (KHTML, like Gecko) Chrome/${chromeVersion} ${
        isMobile ? 'Mobile Safari' : 'Safari'
      }/${appleWebKitVersion}`;
    }
    case 'Firefox': {
      const linuxVersion = getRandomItemFromArray(LINUX_VERSIONS);

      const linuxOptions = isLinux ? `Ubuntu/${linuxVersion} ` : '';

      return `${linuxOptions}Gecko/20100101 Firefox/${firefoxVersion}`;
    }
    case 'Safari': {
      const appleWebKitVersion = getRandomItemFromArray(APPLE_WEBKIT_VERSIONS);
      const safariVersion = getRandomItemFromArray(SAFARI_VERSIONS);

      return `AppleWebKit/${appleWebKitVersion} (KHTML, like Gecko) Version/${safariVersion} Safari/${appleWebKitVersion}`;
    }
    case 'Mobile Safari': {
      const appleWebKitVersion = getRandomItemFromArray(APPLE_WEBKIT_VERSIONS);
      const safariVersion = getRandomItemFromArray(SAFARI_VERSIONS);
      const mobileVersion = getRandomItemFromArray(['15E148', '12B410']);

      return `AppleWebKit/${appleWebKitVersion} (KHTML, like Gecko) Version/${safariVersion} Mobile/${mobileVersion} Safari/${appleWebKitVersion}`;
    }
    default:
      return '';
  }
};

const getRandomUserAgent = (args: GetRandomUserAgent) => {
  const firefoxVersion = getRandomItemFromArray(FIREFOX_VERSIONS);

  const osConfig = getOsConfig(args);
  const browserConfig = getBrowserConfig(args, firefoxVersion);

  const rv = args.browser === 'Firefox' ? `; rv:${firefoxVersion}` : '';

  return `Mozilla/5.0 (${osConfig}${rv}) ${browserConfig}`;
};

const prepareHeadersData = () => {
  const languages = getRandomLanguages();
  const isMobile = getRandomItemFromArray([true, false]);
  const os = getRandomOS(isMobile);
  const isApple = os === 'iOS' || os === 'macOS';
  const browser = getRandomBrowser(isMobile, isApple);

  const firstLanguage = languages[0] || '';
  const firstLanguageSymbol = firstLanguage.split(',')[0] || '';

  const userAgent = getRandomUserAgent({
    language: firstLanguageSymbol,
    os,
    browser,
    isMobile,
  });

  return {
    userAgent,
    languages,
    isMobile,
    os,
    browser,
  };
};
export const getUserAgentHeader = () => {
  const { userAgent } = prepareHeadersData();

  return {
    'User-Agent': userAgent,
  };
};

export const getHeaders = (additionalHeaders: StringRecord = {}): StringRecord => {
  const { languages, os, isMobile, userAgent } = prepareHeadersData();

  return {
    accept: '*/*',
    'accept-language': languages.join(','),
    'content-type': 'application/json',
    'sec-ch-ua-mobile': isMobile ? '?1' : '?0',
    'sec-ch-ua-platform': `\\"${os}\\"`,
    'sec-fetch-site': 'same-origin',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'User-Agent': userAgent,

    ...additionalHeaders,
  };
};
