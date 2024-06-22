import {
  base,
  dev,
  checkers,
  flow_1,
  flow_2,
  flow_3,
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
    case 'flow-1':
      return flow_1;
    case 'flow-2':
      return flow_2;
    case 'flow-3':
      return flow_3;

    default:
      throw new Error('Route name is wrong');
  }
};
