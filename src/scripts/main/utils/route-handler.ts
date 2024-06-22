import {
  base,
  dev,
  checkers,
  new_accounts,
  flow_1,
  flow_2,
  flow_3,
  flow_4,
  one_time,
  check_balances,
  // lowCost, warmUp, volume
} from '../../../_inputs/settings/routes';
import { Route } from '../../../types';

export const routeHandler = (route: Route) => {
  switch (route) {
    case 'base':
      return base;
    case 'dev':
      return dev;
    case 'checkers':
      return checkers;
    case 'new-accounts':
      return new_accounts;
    case 'one-time':
      return one_time;
    case 'flow-1':
      return flow_1;
    case 'flow-2':
      return flow_2;
    case 'flow-3':
      return flow_3;
    case 'flow-4':
      return flow_4;
    case 'check-balances':
      return check_balances;

    // case 'low-cost':
    //   return lowCost;
    // case 'warm-up':
    //   return warmUp;
    // case 'volume':
    //   return volume;

    default:
      throw new Error('Route name is wrong');
  }
};
