import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTransactionSync1700000000004 implements MigrationInterface {
    name = 'CreateUserTransactionSync1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_transaction_syncs table
        await queryRunner.query(`
            CREATE TABLE "user_transaction_syncs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userAddress" character varying NOT NULL,
                "synced" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_transaction_syncs_id" PRIMARY KEY ("id")
            )
        `);

        // Create index for userAddress for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_user_transaction_syncs_userAddress" ON "user_transaction_syncs" ("userAddress")
        `);

        // Create unique index for userAddress to ensure one record per user
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_user_transaction_syncs_userAddress_unique" ON "user_transaction_syncs" ("userAddress")
        `);

        // Add check constraint for non-empty userAddress
        await queryRunner.query(`
            ALTER TABLE "user_transaction_syncs" 
            ADD CONSTRAINT "CHK_user_transaction_syncs_userAddress_not_empty" 
            CHECK (LENGTH("userAddress") > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop check constraints
        await queryRunner.query(`ALTER TABLE "user_transaction_syncs" DROP CONSTRAINT "CHK_user_transaction_syncs_userAddress_not_empty"`);
        
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_user_transaction_syncs_userAddress_unique"`);
        await queryRunner.query(`DROP INDEX "IDX_user_transaction_syncs_userAddress"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "user_transaction_syncs"`);
    }
}
