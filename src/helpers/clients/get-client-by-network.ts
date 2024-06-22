import {
  ArbitrumClient,
  AvalancheClient,
  BaseClient,
  BlastClient,
  BscClient,
  CeloClient,
  CoreClient,
  EthClient,
  FantomClient,
  GnosisClient,
  KlayClient,
  LineaClient,
  OpBnbClient,
  OptimismClient,
  PolygonClient,
  PolygonZkEvmClient,
  ScrollClient,
  ZkFairClient,
  ZkSyncClient,
  ZoraClient,
} from '../../clients';
import { LoggerType } from '../../logger';
import { Networks, SupportedNetworks, WalletData } from '../../types';
import { decryptKey } from '../cryptography-handlers';

export const getClientByNetwork = (networkName: SupportedNetworks, logger: LoggerType, wallet: WalletData) => {
  let decryptedPrivKey;
  if (wallet.privKey) {
    decryptedPrivKey = decryptKey(wallet.privKey);
  }
  const walletWithDecryptedPrivKey = {
    ...wallet,
    privKey: decryptedPrivKey,
  };

  switch (networkName) {
    case Networks.BLAST:
      return new BlastClient(logger, walletWithDecryptedPrivKey);

    case Networks.BSC:
      return new BscClient(logger, walletWithDecryptedPrivKey);
    case Networks.OP_BNB:
      return new OpBnbClient(logger, walletWithDecryptedPrivKey);
    case Networks.ETH:
      return new EthClient(logger, walletWithDecryptedPrivKey);

    case Networks.POLYGON:
      return new PolygonClient(logger, walletWithDecryptedPrivKey);
    case Networks.ARBITRUM:
      return new ArbitrumClient(logger, walletWithDecryptedPrivKey);
    case Networks.AVALANCHE:
      return new AvalancheClient(logger, walletWithDecryptedPrivKey);
    case Networks.OPTIMISM:
      return new OptimismClient(logger, walletWithDecryptedPrivKey);

    case Networks.ZKSYNC:
      return new ZkSyncClient(logger, walletWithDecryptedPrivKey);
    case Networks.ZKFAIR:
      return new ZkFairClient(logger, walletWithDecryptedPrivKey);
    case Networks.POLYGON_ZKEVM:
      return new PolygonZkEvmClient(logger, walletWithDecryptedPrivKey);

    case Networks.BASE:
      return new BaseClient(logger, walletWithDecryptedPrivKey);
    case Networks.LINEA:
      return new LineaClient(logger, walletWithDecryptedPrivKey);
    case Networks.SCROLL:
      return new ScrollClient(logger, walletWithDecryptedPrivKey);
    case Networks.FANTOM:
      return new FantomClient(logger, walletWithDecryptedPrivKey);

    case Networks.CORE:
      return new CoreClient(logger, walletWithDecryptedPrivKey);
    case Networks.CELO:
      return new CeloClient(logger, walletWithDecryptedPrivKey);
    case Networks.ZORA:
      return new ZoraClient(logger, walletWithDecryptedPrivKey);

    case Networks.GNOSIS:
      return new GnosisClient(logger, walletWithDecryptedPrivKey);
    case Networks.KLAY:
      return new KlayClient(logger, walletWithDecryptedPrivKey);

    default:
      throw new Error(`Client for ${networkName} network was not found`);
  }
};

export type ClientType = ReturnType<typeof getClientByNetwork>;
export type ClientClass = new (logger: LoggerType, wallet: WalletData) => ClientType;
