import { WalletData } from '../../types';

export const getFullDataByWallets = (wallets: string[], jsonWallets: WalletData[]) => {
  return wallets.reduce<WalletData[]>((acc, cur) => {
    const foundRow = jsonWallets.find((wallet) => wallet.walletAddress === cur);

    if (foundRow) {
      return [...acc, foundRow];
    }

    return acc;
  }, []);
};
