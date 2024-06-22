import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('between-modules_walletId', ['walletId'])
@Entity('BetweenModules')
export class BetweenModulesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'float', name: 'amount' })
  amount: number;
  @Column('varchar', { length: 255, name: 'token' })
  token: string;
  @Column('varchar', { length: 255, name: 'network' })
  network: string;

  @Column('varchar', { length: 255, name: 'wallet_id' })
  walletId: string;
  @Column({ type: 'int', nullable: true })
  index: number;
}
