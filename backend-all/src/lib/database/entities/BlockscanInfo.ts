import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("blockscan_infos")
export class BlockscanInfo extends BaseEntity {
  @Column({ type: "text" })
  lastBlockScanned: string; // Using text for very long block numbers

  @Column()
  chainId: string;

  @Column()
  contractAddress: string;
}
