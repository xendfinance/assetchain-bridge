import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTransactionHashNullable1700000000007 implements MigrationInterface {
    name = 'MakeTransactionHashNullable1700000000007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make transactionHash column nullable
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ALTER COLUMN "transactionHash" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Make transactionHash column NOT NULL again
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ALTER COLUMN "transactionHash" SET NOT NULL
        `);
    }
}
