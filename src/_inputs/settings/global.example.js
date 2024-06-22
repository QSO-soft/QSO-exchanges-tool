// Секретная фраза, которая будет использоваться для шифрования ваших приватных данных
// Эта же фраза будет использоваться и для их расшифровки по этому не удаляйте её!
// Пример: 'abracadabra209581kdhask'
export const SECRET_PHRASE = 'abracadabra';

// Приватные данные для экстренных telegram уведомлений
export const TELEGRAM = {
  // Создаём тут -> https://t.me/BotFather
  // Пример: 3351122561:BBAh5G_Xdkljlkf2fkjansfdaskjnfwk1
  token: {
    modulesInfo: '', // уведомления про выполнение модулей
    criticalErrors: '', // уведомления с критическими ошибками, которые возможно нужно исправить самому (например, пополнить баланс)
  },

  // Узнать можно тут -> https://t.me/getmyid_bot
  // Пример: [721667338, 721667339]
  IDs: {
    modulesInfo: [],
    criticalErrors: [],
  },
};

// Приватные данные от OKX для авто-пополнения
export const OKX = {
  // Имя аккаунта, который будет использоваться в скриптах
  // Сделан этот выбор, чтобы можно было легко и удобно переключаться между разными ОКХ
  accountName: 'account-1',

  // Имя аккаунта, который будет использоваться для вывода в сети Aptos
  aptosAccountName: 'account-2',

  // Указав имейл ОКХ в данном поле,
  // при выполнении модуля okx-collect, балансы всех ОКХ будут перекидываться на него
  // Пример: example@gmail.com
  collectAccountEmail: '',
  // Если указан collectAccountEmail и это имейл привязан к одному из ОКС в okxAccounts,
  // то следует указать имя этого аккаунта тут, чтобы скрипт не пробовал перевести деньги с него на самого себя
  // Пример: 'accountName1'
  collectAccountName: '',

  // Создать можно тут -> https://www.okx.com/ru/account/my-api
  accounts: {
    // Имя может быть любое, главное чтобы в accountName было такое же
    'account-1': {
      apiKey: '',
      secret: '',
      password: '',
    },
    'account-2': {
      apiKey: '',
      secret: '',
      password: '',
    },
    'account-3': {
      apiKey: '',
      secret: '',
      password: '',
    },
  },

  // Пример: login:password@ip:port
  proxy: '',
};

// Приватные данные от Binance для авто-пополнения
export const BINANCE = {
  // Создать можно тут -> https://www.binance.com/en/binance-api
  secretKeys: {
    apiKey: '',
    secret: '',
  },

  // Пример: login:password@ip:port
  proxy: '',
};

// Приватные данные от Bitget
export const BITGET = {
  apiKey: '',
  secret: '',
  passphrase: '',

  // Пример: login:password@ip:port
  proxy: '',
};

// Приватные данные от Gate
export const GATE = {
  secretKeys: {
    apiKey: '',
    secret: '',
  },

  proxy: '',
};

// Ваша приватная RPC (не обязательно)
export const RPC = {
  blast: '',

  bsc: '',
  opBNB: '',
  eth: '',

  polygon: '',
  arbitrum: '',
  avalanche: '',
  optimism: '',

  zkSync: '',
  zkFair: '',
  polygon_zkevm: '',

  base: '',
  linea: '',
  scroll: '',
  fantom: '',

  core: '',
  celo: '',
  zora: '',

  gnosis: '',
  klay: '',

  moonbeam: '',

  aptos: '',
  starknet: '',
};
