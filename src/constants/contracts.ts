import { getAddress } from 'viem';

import { defaultTokenAbi } from '../clients/abi';
import {
  ArbitrumTokens,
  AvalancheTokens,
  BaseTokens, BlastTokens,
  BnbTokens,
  CeloTokens,
  CoreTokens,
  EthTokens,
  EvmTokens,
  GnosisTokens,
  LineaTokens,
  MoonbeamTokens,
  OptimismTokens,
  PolygonTokens,
  ScrollTokens,
  TokenContract,
  ZkSyncTokens,
  ZoraTokens,
} from '../types';

export const NATIVE_TOKEN_CONTRACT = getAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
export const ZERO_TOKEN_CONTRACT = '0x0000000000000000000000000000000000000000';
export const EVM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: EvmTokens.wstETH,
    address: getAddress('0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.USDT,
    address: getAddress('0xA219439258ca9da29E9Cc4cE5596924745e12B93'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.DAI,
    address: getAddress('0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.USDC,
    address: getAddress('0x176211869cA2b568f2A7D4EE941E073a821EE1ff'),
    abi: defaultTokenAbi,
  },
];
export const BNB_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BnbTokens.BNB,
    address: NATIVE_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.USDT,
    address: getAddress('0x55d398326f99059fF775485246999027B3197955'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.USDC,
    address: getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.DAI,
    address: getAddress('0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.ETH,
    address: getAddress('0x2170Ed0880ac9A755fd29B2688956BD959F933F8'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.AI,
    address: getAddress('0xBDA011D7F8EC00F66C1923B049B94c67d148d8b2'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.PEPE,
    address: getAddress('0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.UNI,
    address: getAddress('0xBf5140A22578168FD562DCcF235E5D43A02ce9B1'),
    abi: defaultTokenAbi,
  },
];

export const AVALANCHE_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: AvalancheTokens.USDC,
    address: getAddress('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'),
    abi: defaultTokenAbi,
  },
  {
    name: AvalancheTokens.USDT,
    address: getAddress('0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'),
    abi: defaultTokenAbi,
  },
  {
    name: AvalancheTokens.DAI,
    address: getAddress('0xd586E7F844cEa2F87f50152665BCbc2C279D8d70'),
    abi: defaultTokenAbi,
  },
];
export const ARBITRUM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ArbitrumTokens.ARB,
    address: getAddress('0x912CE59144191C1204E64559FE8253a0e49E6548'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.ETH,
    address: getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.WETH,
    address: getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.USDC,
    address: getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.USDT,
    address: getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.DAI,
    address: getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.PEPE,
    address: getAddress('0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.UNI,
    address: getAddress('0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'),
    abi: defaultTokenAbi,
  },
];
export const ZORA_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ZoraTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: ZoraTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
];
export const OPTIMISM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: OptimismTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.USDC,
    address: getAddress('0x7f5c764cbc14f9669b88837ca1490cca17c31607'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.USDT,
    address: getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.DAI,
    address: getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.RPL,
    address: getAddress('0xC81D1F0EB955B0c020E5d5b264E1FF72c14d1401'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.OP,
    address: getAddress('0x4200000000000000000000000000000000000042'),
    abi: defaultTokenAbi,
  },
];
export const POLYGON_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: PolygonTokens.MATIC,
    address: getAddress('0x0000000000000000000000000000000000001010'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.WETH,
    address: getAddress('0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.USDC,
    address: getAddress('0x2791bca1f2de4661ed88a30c99a7a9449aa84174'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.USDT,
    address: getAddress('0xc2132D05D31c914a87C6611C10748AEb04B58e8F'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.DAI,
    address: getAddress('0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.UNI,
    address: getAddress('0xb33EaAd8d922B1083446DC23f610c2567fB5180f'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.AAVE,
    address: getAddress('0xD6DF932A45C0f255f85145f286eA0b292B21C90B'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.BUSD,
    address: getAddress('0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7'),
    abi: defaultTokenAbi,
  },
];
export const ZKSYNC_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ZkSyncTokens.ETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.WETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.USDC,
    address: getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.USDT,
    address: getAddress('0x493257fD37EDB34451f62EDf8D2a0C418852bA4C'),
    abi: defaultTokenAbi,
  },
];
export const BASE_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BaseTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.USDC,
    address: getAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.DAI,
    address: getAddress('0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.rETH,
    address: getAddress('0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c'),
    abi: defaultTokenAbi,
  },
];
export const ETH_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: EthTokens.ETH,
    address: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.WETH,
    address: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.USDC,
    address: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.USDT,
    address: getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.DAI,
    address: getAddress('0x6b175474e89094c44da98b954eedeac495271d0f'),
    abi: defaultTokenAbi,
  },
];
export const LINEA_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: LineaTokens.ETH,
    address: getAddress('0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.WETH,
    address: getAddress('0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.USDC,
    address: getAddress('0x176211869cA2b568f2A7D4EE941E073a821EE1ff'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.USDT,
    address: getAddress('0xA219439258ca9da29E9Cc4cE5596924745e12B93'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.DAI,
    address: getAddress('0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.PEPE,
    address: getAddress('0x7da14988E4f390C2E34ed41DF1814467D3aDe0c3'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.UNI,
    address: getAddress('0x636B22bC471c955A8DB60f28D4795066a8201fa3'),
    abi: defaultTokenAbi,
  },
];
export const BLAST_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BlastTokens.ETH,
    address: getAddress('0x4300000000000000000000000000000000000004'),
    abi: defaultTokenAbi,
  },
  {
    name: BlastTokens.WETH,
    address: getAddress('0x4300000000000000000000000000000000000004'),
    abi: defaultTokenAbi,
  },
  {
    name: BlastTokens.USDB,
    address: getAddress('0x4300000000000000000000000000000000000003'),
    abi: defaultTokenAbi,
  },

];
export const SCROLL_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ScrollTokens.ETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.WETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.USDC,
    address: getAddress('0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.USDT,
    address: getAddress('0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.DAI,
    address: getAddress('0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97'),
    abi: defaultTokenAbi,
  },
];

export const CELO_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: CeloTokens.WETH,
    address: getAddress('0x122013fd7dF1C6F636a5bb8f03108E876548b455'),
    abi: defaultTokenAbi,
  },
  {
    name: CeloTokens.USDT,
    address: getAddress('0x617f3112bf5397D0467D315cC709EF968D9ba546'),
    abi: defaultTokenAbi,
  },
  {
    name: CeloTokens.USDC,
    address: getAddress('0xef4229c8c3250C675F21BCefa42f58EfbfF6002a'),
    abi: defaultTokenAbi,
  },
  {
    name: CeloTokens.cUSD,
    address: getAddress('0x765DE816845861e75A25fCA122bb6898B8B1282a'),
    abi: defaultTokenAbi,
  },
  {
    name: CeloTokens.CELO,
    address: getAddress('0x471EcE3750Da237f93B8E339c536989b8978a438'),
    abi: defaultTokenAbi,
  },
];
export const CORE_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: CoreTokens.CORE,
    address: getAddress('0xf2B8fEA09420d4a6A567cDb2598505DEE5c97eBD'),
    abi: defaultTokenAbi,
  },
];
export const GNOSIS_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: GnosisTokens.USDT,
    address: getAddress('0x4ECaBa5870353805a9F068101A40E0f32ed605C6'),
    abi: defaultTokenAbi,
  },
  {
    name: GnosisTokens.USDC,
    address: getAddress('0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'),
    abi: defaultTokenAbi,
  },
  {
    name: GnosisTokens.UNI,
    address: getAddress('0x4537e328Bf7e4eFA29D05CAeA260D7fE26af9D74'),
    abi: defaultTokenAbi,
  },
  {
    name: GnosisTokens.GNO,
    address: getAddress('0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb'),
    abi: defaultTokenAbi,
  },
  {
    name: GnosisTokens.RPL,
    address: getAddress('0x2F0E755Efe6b58238A67DB420Ff3513Ec1fb31eF'),
    abi: defaultTokenAbi,
  },
];
export const MOONBEAM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: MoonbeamTokens.USDT,
    address: getAddress('0xc30E9cA94CF52f3Bf5692aaCF81353a27052c46f'),
    abi: defaultTokenAbi,
  },
  {
    name: MoonbeamTokens.USDC,
    address: getAddress('0x931715FEE2d06333043d11F658C8CE934aC61D0c'),
    abi: defaultTokenAbi,
  },
  {
    name: MoonbeamTokens.WETH,
    address: getAddress('0xab3f0245B83feB11d15AAffeFD7AD465a59817eD'),
    abi: defaultTokenAbi,
  },
  {
    name: MoonbeamTokens.WGLMR,
    address: getAddress('0xAcc15dC74880C9944775448304B263D191c6077F'),
    abi: defaultTokenAbi,
  },
];
