// Описание роута:
// Базовый роут, который предназначен для запуска, после деплоя кошелька для набива транзакций и контрактов

import { GroupSettings, NumberRange, RouteSettings, UserModuleConfig } from '../../../types';

// ====================== MODULES ======================
// Из всех модулей, возьмёт только 1 рандомный
// Укажите [0, 0] если хотите чтобы использовались все модули
const countModules = [0, 0] as NumberRange;

const groupSettings: GroupSettings = {};

const modules: UserModuleConfig[] = [
  {
    moduleName: 'binance-withdraw',
    count: [1, 1],
    indexGroup: 0,

    // Сеть из которой нужно делать вывод с Binance. bsc | opBNB | polygon
    binanceWithdrawNetwork: 'base',

    // При рандомных сетях будет браться нативный токен сети
    tokenToWithdraw: 'ZRO',

    // При указании данного поля сеть для вывода будет выбрана рандомно из списка
    // Работает только, если useUsd = true
    randomBinanceWithdrawNetworks: ['base', 'optimism'],

    // Сумма в диапазоне ОТ и ДО, которая будет выведена с Binance в токене, который указан в tokenToWithdraw
    minAndMaxAmount: [11, 12],

    // Если баланс токена в tokenToWithdraw будет ниже этого значения, только тогда будет авто-пополнение
    minTokenBalance: 10,

    waitTime: 120,

    // Где именно смотреть баланс minNativeBalance
    // minNativeBalanceNetwork: 'bsc',

    // Модуль будет выполнен, только, если высчитанный amount вместе с fee будет больше указанного значение
    minAmount: 0,

    // Ожидаемый баланс на кошельке, который должен быть после выполнения модуля. При указании данного параметра, minAndMaxAmount и minNativeBalance не учитываются
    expectedBalance: [0, 0],

    // Использовать ли USD как значения балансов, amount
    useUsd: false,
  },
];

// Выполнит скрипт на указанном количестве кошельков
// То есть из 100 кошельков, которые попадут под фильтр - возьмёт в работу только первые
// Если хотите отключить, укажите 0!
const limitWalletsToUse = 0;

// Перемешает все транзакции конкретного модуля между всеми модулями.
// Если у вас будет указано false, тогда транзакции модуля, которые указаны в count будут вызываться одна за одной.
// Если указали true:
// Вот это - [{ moduleName: 'starkVerse', count: [2,2] }, { moduleName: 'dmail', count: [2,2] }]
// Превратится в это - [{moduleName: 'starkVerse', count: [1,1]}, {moduleName: 'starkVerse', count: [1,1]}, {moduleName: 'dmail', count: [1,1]}, {moduleName: 'dmail', count: [1,1]}]
// А если вы указали в settings.shuffle.modules: true, тогда они еще перемешаются между собой.
const splitModuleCount = true;

export const flow_1: RouteSettings = {
  modules,
  countModules,
  groupSettings,
  limitWalletsToUse,
  splitModuleCount,
};
