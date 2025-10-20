import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionDateToTransaction1700000000005 implements MigrationInterface {
    name = 'AddTransactionDateToTransaction1700000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add transactionDate column to transactions table
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD COLUMN "transactionDate" TIMESTAMP
        `);

        // Create index for transactionDate for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_transactionDate" ON "transactions" ("transactionDate")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_transactions_transactionDate"`);
        
        // Drop column
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionDate"`);
    }
}
