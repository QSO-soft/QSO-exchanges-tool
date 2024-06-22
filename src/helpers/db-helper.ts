import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { WalletData } from '../types';

interface BaseProps<Entity extends EntityTarget<ObjectLiteral>> {
  dbSource: DataSource;
  wallet: WalletData;
  moduleName?: string;
  moduleIndex?: number;
  entity: Entity;
}

type RecreateDbItem<Entity extends EntityTarget<ObjectLiteral>> = BaseProps<Entity> & {
  data: object;
};
export const recreateDbItem = async <Entity extends EntityTarget<ObjectLiteral>>({
  dbSource,
  entity,
  wallet,
  moduleName,
  moduleIndex,
  data,
}: RecreateDbItem<Entity>) => {
  const { item, dbRepo } = await findDbItem({
    dbSource,
    entity,
    wallet,
    moduleName,
    moduleIndex,
  });

  if (item) {
    await dbRepo.remove(item);
  }

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    ...(!!moduleName && {
      moduleName,
    }),
    ...(typeof moduleIndex === 'number' && {
      moduleIndex,
    }),
    ...data,
  });

  return dbRepo.save(created);
};

type FindDbItem<Entity extends EntityTarget<ObjectLiteral>> = BaseProps<Entity>;
export const findDbItem = async <Entity extends EntityTarget<ObjectLiteral>>({
  dbSource,
  entity,
  wallet,
  moduleName,
  moduleIndex,
}: FindDbItem<Entity>) => {
  const dbRepo = dbSource.getRepository(entity);

  const item = await dbRepo.findOne({
    where: {
      walletId: wallet.id,
      index: wallet.index,
      ...(!!moduleName && {
        moduleName,
      }),
      ...(typeof moduleIndex === 'number' && {
        moduleIndex,
      }),
    },
  });

  return {
    dbRepo,
    item,
  };
};
