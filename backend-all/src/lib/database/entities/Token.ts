import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { BridgeInfo } from "./BridgeInfo";

@Entity("tokens")
export class Token extends BaseEntity {
  @Column()
  tokenAddress: string;

  @Column()
  decimal: number;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column()
  chainId: string;

  @OneToMany("BridgeInfo", "token")
  bridgeInfos: BridgeInfo[];
}
