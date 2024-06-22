import { IModuleManager, ModuleManager as DefaultModuleManager } from '../../../../managers/module-manager';
import { ModuleNames } from '../../../../types';
import {
  execBalanceChecker,
  execBinanceWithdraw,
  execCheckNativeBalance,
  execMakeBitgetCollect,
  execMakeBitgetDeposit,
  execMakeBitgetWaitBalance,
  execMakeBitgetWithdraw,
  execMakeGateWithdraw,
  execMakeTransferToken,
  execOkxCollect,
  execOkxWithdraw,
} from '../../modules';

export class ModuleManager extends DefaultModuleManager {
  constructor(args: IModuleManager) {
    super(args);
  }

  findModule(moduleName: ModuleNames) {
    switch (moduleName) {
      case 'binance-withdraw':
        return execBinanceWithdraw;
      case 'okx-withdraw':
        return execOkxWithdraw;
      case 'okx-collect':
        return execOkxCollect;
      case 'bitget-withdraw':
        return execMakeBitgetWithdraw;
      case 'bitget-deposit':
        return execMakeBitgetDeposit;
      case 'bitget-collect':
        return execMakeBitgetCollect;
      case 'bitget-wait-balance':
        return execMakeBitgetWaitBalance;
      case 'gate-withdraw':
        return execMakeGateWithdraw;

      case 'transfer-token':
        return execMakeTransferToken;
      case 'balance-checker':
        return execBalanceChecker;
      case 'check-native-balance':
        return execCheckNativeBalance;

      default:
        return;
    }
  }
}
