import { DataSource } from 'typeorm';

const PROJECT_NAME = 'main';
const CURRENT_PATH = `./src/scripts/${PROJECT_NAME}/db`;
export default new DataSource({
  type: 'sqlite',
  database: `./src/_outputs/db/${PROJECT_NAME}.db`,
  entities: [`${CURRENT_PATH}/entities/*.entity.ts`],
  migrations: [`${CURRENT_PATH}/migrations/*.ts`],
  logging: false,
  synchronize: false,
  migrationsRun: true,
});
