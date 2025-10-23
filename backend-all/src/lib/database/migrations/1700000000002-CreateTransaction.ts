import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransaction1700000000002 implements MigrationInterface {
    name = 'CreateTransaction1700000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create transactions table
        await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" text NOT NULL,
                "timestamp" text NOT NULL,
                "fromUser" character varying NOT NULL,
                "toUser" character varying NOT NULL,
                "fromChain" character varying NOT NULL,
                "toChain" character varying NOT NULL,
                "nonce" integer NOT NULL,
                "symbol" character varying NOT NULL,
                "fulfillAmount" text NOT NULL,
                "fulfillFromChain" character varying NOT NULL,
                "fulfillNonce" integer NOT NULL,
                "fulfillFromUser" character varying NOT NULL,
                "fulfillToUser" character varying NOT NULL,
                "txBlock" text NOT NULL,
                "confirmations" integer NOT NULL,
                "fulfilled" boolean NOT NULL DEFAULT false,
                "index" integer NOT NULL,
                "userAddress" character varying NOT NULL,
                "chainId" character varying NOT NULL,
                "transactionHash" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_userAddress" ON "transactions" ("userAddress")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_chainId" ON "transactions" ("chainId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_fromUser" ON "transactions" ("fromUser")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_toUser" ON "transactions" ("toUser")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_nonce" ON "transactions" ("nonce")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_symbol" ON "transactions" ("symbol")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_fulfilled" ON "transactions" ("fulfilled")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_fromChain" ON "transactions" ("fromChain")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_toChain" ON "transactions" ("toChain")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_transactionHash" ON "transactions" ("transactionHash")
        `);

        // Create composite indexes for common queries
        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_userAddress_chainId" ON "transactions" ("userAddress", "chainId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_fromUser_nonce" ON "transactions" ("fromUser", "nonce")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_fulfillFromUser_fulfillNonce" ON "transactions" ("fulfillFromUser", "fulfillNonce")
        `);

        // Add check constraints for positive values
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_nonce_positive" 
            CHECK ("nonce" >= 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_fulfillNonce_positive" 
            CHECK ("fulfillNonce" >= 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_confirmations_positive" 
            CHECK ("confirmations" >= 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_index_positive" 
            CHECK ("index" >= 0)
        `);

        // Add check constraints for non-empty strings
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_userAddress_not_empty" 
            CHECK (LENGTH("userAddress") > 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_chainId_not_empty" 
            CHECK (LENGTH("chainId") > 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "CHK_transactions_symbol_not_empty" 
            CHECK (LENGTH("symbol") > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop check constraints
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_symbol_not_empty"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_chainId_not_empty"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_userAddress_not_empty"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_index_positive"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_confirmations_positive"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_fulfillNonce_positive"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_nonce_positive"`);
        
        // Drop composite indexes
        await queryRunner.query(`DROP INDEX "IDX_transactions_fulfillFromUser_fulfillNonce"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_fromUser_nonce"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_userAddress_chainId"`);
        
        // Drop single column indexes
        await queryRunner.query(`DROP INDEX "IDX_transactions_transactionHash"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_toChain"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_fromChain"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_fulfilled"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_symbol"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_nonce"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_toUser"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_fromUser"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_chainId"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_userAddress"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "transactions"`);
    }
}
