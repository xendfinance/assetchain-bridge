import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Token } from "./Token";
import { Transaction } from "./Transaction";

@Entity("bridge_infos")
export class BridgeInfo extends BaseEntity {
  @Column()
  bridgeAddress: string;

  @Column()
  chainId: string;

  @Column({ type: "jsonb" })
  fees: {
    feeFulfill: number;
    feeSend: number;
  };

  @ManyToOne("Token", "bridgeInfos", { 
    onDelete: "CASCADE",
    nullable: false 
  })
  @JoinColumn({ name: "tokenId" })
  token: Token;

  @Column()
  tokenId: string;

  @Column({ type: "text" })
  limitPerSend: string;

  @Column()
  tokenDecimal: number;

  @OneToMany(() => Transaction, (transaction) => transaction.bridgeInfo)
  transactions: Transaction[];
}
