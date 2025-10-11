import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClaimTransactionToTransaction1700000000009 implements MigrationInterface {
    name = 'AddClaimTransactionToTransaction1700000000009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add claimTransactionHash column to transactions table
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD COLUMN "claimTransactionHash" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop claimTransactionHash column
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "claimTransactionHash"`);
    }
}
