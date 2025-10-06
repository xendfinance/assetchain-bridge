import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { BridgeInfo } from "./BridgeInfo";

@Entity("transactions")
export class Transaction extends BaseEntity {
  // From BridgeTransaction
  @Column({ type: "text" })
  amount: string; // Using text for very long bigint values

  @Column({ type: "text" })
  timestamp: string; // Using text for very long bigint values

  @Column()
  fromUser: string;

  @Column()
  toUser: string;

  @Column()
  fromChain: string;

  @Column()
  toChain: string;

  @Column()
  nonce: number;

  @Column()
  symbol: string;

  // From FulfilTransaction
  @Column({ type: "text" })
  fulfillAmount: string; // Using text for very long bigint values

  @Column()
  fulfillFromChain: string;

  @Column()
  fulfillNonce: number;

  @Column()
  fulfillFromUser: string;

  @Column()
  fulfillToUser: string;

  // From ClaimInfo
  @Column({ type: "text" })
  txBlock: string; // Using text for very long bigint values

  @Column()
  confirmations: number;

  // Additional fields
  @Column()
  fulfilled: boolean;

  @Column()
  index: number;

  // New fields requested
  @Column()
  userAddress: string;

  @Column()
  chainId: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  claimTransactionHash: string;

  @Column({ type: "timestamp" })
  transactionDate: Date;

  // map to BridgeInfo
  @Column()
  bridgeInfoId: string;

  @ManyToOne(() => BridgeInfo, (bridgeInfo) => bridgeInfo.transactions)
  @JoinColumn({ name: "bridgeInfoId" })
  bridgeInfo: BridgeInfo;
}
