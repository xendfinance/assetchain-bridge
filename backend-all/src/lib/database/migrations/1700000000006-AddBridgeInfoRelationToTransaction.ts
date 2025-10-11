import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBridgeInfoRelationToTransaction1700000000006 implements MigrationInterface {
    name = 'AddBridgeInfoRelationToTransaction1700000000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add bridgeInfoId column to transactions table
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD COLUMN "bridgeInfoId" uuid
        `);

        // Create foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "FK_transactions_bridgeInfoId" 
            FOREIGN KEY ("bridgeInfoId") 
            REFERENCES "bridge_infos"("id") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Create index for bridgeInfoId for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_transactions_bridgeInfoId" ON "transactions" ("bridgeInfoId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_transactions_bridgeInfoId"`);
        
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_bridgeInfoId"`);
        
        // Drop column
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "bridgeInfoId"`);
    }
}
