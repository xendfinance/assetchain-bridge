import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlockscanInfo1700000000003 implements MigrationInterface {
    name = 'CreateBlockscanInfo1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create blockscan_infos table
        await queryRunner.query(`
            CREATE TABLE "blockscan_infos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "lastBlockScanned" text NOT NULL,
                "chainId" character varying NOT NULL,
                "contractAddress" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_blockscan_infos_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_blockscan_infos_chainId" ON "blockscan_infos" ("chainId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_blockscan_infos_contractAddress" ON "blockscan_infos" ("contractAddress")
        `);

        // Create composite index for unique chain + contract combinations
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_blockscan_infos_chainId_contractAddress" ON "blockscan_infos" ("chainId", "contractAddress")
        `);

        // Add check constraints for non-empty strings
        await queryRunner.query(`
            ALTER TABLE "blockscan_infos" 
            ADD CONSTRAINT "CHK_blockscan_infos_chainId_not_empty" 
            CHECK (LENGTH("chainId") > 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "blockscan_infos" 
            ADD CONSTRAINT "CHK_blockscan_infos_contractAddress_not_empty" 
            CHECK (LENGTH("contractAddress") > 0)
        `);

        await queryRunner.query(`
            ALTER TABLE "blockscan_infos" 
            ADD CONSTRAINT "CHK_blockscan_infos_lastBlockScanned_not_empty" 
            CHECK (LENGTH("lastBlockScanned") > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop check constraints
        await queryRunner.query(`ALTER TABLE "blockscan_infos" DROP CONSTRAINT "CHK_blockscan_infos_lastBlockScanned_not_empty"`);
        await queryRunner.query(`ALTER TABLE "blockscan_infos" DROP CONSTRAINT "CHK_blockscan_infos_contractAddress_not_empty"`);
        await queryRunner.query(`ALTER TABLE "blockscan_infos" DROP CONSTRAINT "CHK_blockscan_infos_chainId_not_empty"`);
        
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_blockscan_infos_chainId_contractAddress"`);
        await queryRunner.query(`DROP INDEX "IDX_blockscan_infos_contractAddress"`);
        await queryRunner.query(`DROP INDEX "IDX_blockscan_infos_chainId"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "blockscan_infos"`);
    }
}
