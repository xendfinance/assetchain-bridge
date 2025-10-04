import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("user_transaction_syncs")
export class UserTransactionSync extends BaseEntity {
  @Column()
  userAddress: string;

  @Column({ default: false })
  synced: boolean;
}
