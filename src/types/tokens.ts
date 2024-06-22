export enum EvmTokens {
  wstETH = 'wstETH',
  DAI = 'DAI',
  USDT = 'USDT',
  USDC = 'USDC',
}
export enum EthTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum BnbTokens {
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
  ETH = 'ETH',
  DAI = 'DAI',
  AI = 'AI',
  PEPE = 'PEPE',
  UNI = 'UNI',
  BAT = 'BAT',
  BAL = 'BAL',
}
export enum AvalancheTokens {
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
}
export enum ArbitrumTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  WETH = 'WETH',
  ARB = 'ARB',
  PEPE = 'PEPE',
  UNI = 'UNI',
}
export enum ZoraTokens {
  ETH = 'ETH',
  WETH = 'WETH',
}
export enum CeloTokens {
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  WETH = 'WETH',
  CELO = 'CELO',
  cUSD = 'cUSD',
}
export enum CoreTokens {
  CORE = 'CORE',
}
export enum GnosisTokens {
  USDT = 'USDT',
  USDC = 'USDC',
  UNI = 'UNI',
  GNO = 'GNO',
  RPL = 'RPL',
}
export enum OptimismTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
  OP = 'OP',
  RPL = 'RPL',
}
export enum PolygonTokens {
  MATIC = 'MATIC',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
  UNI = 'UNI',
  AAVE = 'AAVE',
  BUSD = 'BUSD',
}
export enum ZkSyncTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
}
export enum BaseTokens {
  ETH = 'ETH',
  USDC = 'USDC',
  USDT = 'USDT',
  WETH = 'WETH',
  DAI = 'DAI',
  rETH = 'rETH',
}
export enum LineaTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  WETH = 'WETH',
  PEPE = 'PEPE',
  UNI = 'UNI',
}
export enum ScrollTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum MoonbeamTokens {
  WETH = 'WETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WGLMR = 'WGLMR',
}
export enum BlastTokens {
  ETH = 'ETH',
  WETH = 'WETH',
  USDB = 'USDB',
}

export enum Token {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  BUSD = 'BUSD',
  MATIC = 'MATIC',
}

export type DefaultTokens = 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'WETH';

export type AvailableSwapTokens =
  | DefaultTokens
  | 'USDB'
  | 'MUSD'
  | 'MIM'
  | 'OMNI'
  | 'BAG'
  | 'AI'
  | 'BLADE'
  | 'YES'
  | 'PAC'
  | 'JUICE'
  | 'YIELD'
  | '$WAI'
  | 'ASO'
  | 'OLE'
  | 'EARLY'
  | 'ORBIT';
// | 'ANDY';

export type AvailableRemainSwapTokens = Exclude<AvailableSwapTokens, 'ETH'>;

const ALL_TOKENS = [
  'ETH',
  'USDC',
  'USDT',
  'DAI',
  'WETH',
  'BNB',
  'MATIC',
  'SOL',
  'MUTE',
  'BUSD',
  'WBTC',
  'rETH',
  'SIS',
  'PEPE',
  '1INCH',
  'AAVE',
  'ACE',
  'AEVO',
  'APE',
  'APT',
  'ARB',
  'ATOM',
  'AVAX',
  'BAL',
  'BETH',
  'BLUR',
  'BONE',
  'CELO',
  'CFX',
  'COMP',
  'CORE',
  'CRV',
  'DAO',
  'DOGE',
  'ELF',
  'EOS',
  'FLM',
  'FLOKI',
  'GALA',
  'GMT',
  'GMX',
  'GPT',
  'ICE',
  'IOTA',
  'IQ',
  'KLAY',
  'LAMB',
  'LINK',
  'LUNA',
  'MAGIC',
  'MANA',
  'MEME',
  'METIS',
  'MINA',
  'MOVR',
  'NEAR',
  'NEO',
  'OP',
  'SHIB',
  'SPELL',
  'STORJ',
  'STRK',
  'SUI',
  'SUN',
  'SUSHI',
  'TIA',
  'TON',
  'UNI',
  'VELO',
  'WOO',
  'XETA',
  'ZETA',
  'ZK',
  'iZi',
  'ASTR',
  'CUSD',
  'EURA',
  'FTM',
  'FUSE',
  'GLMR',
  'JEWEL',
  'KAVA',
  'XDAI',
  'USDB',
] as const;

export type Tokens = (typeof ALL_TOKENS)[number];
