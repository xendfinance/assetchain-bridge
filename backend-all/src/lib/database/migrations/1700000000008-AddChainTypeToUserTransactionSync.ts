import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChainTypeToUserTransactionSync1700000000008 implements MigrationInterface {
    name = 'AddChainTypeToUserTransactionSync1700000000008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add chainType column to user_transaction_syncs table
        await queryRunner.query(`
            ALTER TABLE "user_transaction_syncs" 
            ADD COLUMN "chainType" character varying NOT NULL DEFAULT 'EVM'
        `);

        // Create index for chainType for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_user_transaction_syncs_chainType" ON "user_transaction_syncs" ("chainType")
        `);

        // Create composite index for userAddress and chainType (non-unique)
        await queryRunner.query(`
            CREATE INDEX "IDX_user_transaction_syncs_userAddress_chainType" ON "user_transaction_syncs" ("userAddress", "chainType")
        `);

        // Drop the old unique index on userAddress only
        await queryRunner.query(`
            DROP INDEX "IDX_user_transaction_syncs_userAddress_unique"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop composite index
        await queryRunner.query(`DROP INDEX "IDX_user_transaction_syncs_userAddress_chainType"`);
        
        // Drop chainType index
        await queryRunner.query(`DROP INDEX "IDX_user_transaction_syncs_chainType"`);
        
        // Restore the old unique index on userAddress only
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_user_transaction_syncs_userAddress_unique" ON "user_transaction_syncs" ("userAddress")
        `);
        
        // Drop chainType column
        await queryRunner.query(`ALTER TABLE "user_transaction_syncs" DROP COLUMN "chainType"`);
    }
}
