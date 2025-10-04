import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTokenAndBridgeInfo1700000000001 implements MigrationInterface {
    name = 'CreateTokenAndBridgeInfo1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // Create tokens table
        await queryRunner.query(`
            CREATE TABLE "tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tokenAddress" character varying NOT NULL,
                "decimal" integer NOT NULL,
                "symbol" character varying NOT NULL,
                "name" character varying NOT NULL,
                "chainId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_tokens_id" PRIMARY KEY ("id")
            )
        `);

        // Create bridge_infos table
        await queryRunner.query(`
            CREATE TABLE "bridge_infos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "bridgeAddress" character varying NOT NULL,
                "chainId" character varying NOT NULL,
                "fees" jsonb NOT NULL,
                "tokenId" uuid NOT NULL,
                "limitPerSend" text NOT NULL,
                "tokenDecimal" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bridge_infos_id" PRIMARY KEY ("id")
            )
        `);

        // Create foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "bridge_infos" 
            ADD CONSTRAINT "FK_bridge_infos_tokenId" 
            FOREIGN KEY ("tokenId") 
            REFERENCES "tokens"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_tokens_chainId" ON "tokens" ("chainId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_tokens_symbol" ON "tokens" ("symbol")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_bridge_infos_chainId" ON "bridge_infos" ("chainId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_bridge_infos_tokenId" ON "bridge_infos" ("tokenId")
        `);

        // Add check constraints for fees JSON structure
        await queryRunner.query(`
            ALTER TABLE "bridge_infos" 
            ADD CONSTRAINT "CHK_bridge_infos_fees_structure" 
            CHECK (
                jsonb_typeof("fees") = 'object' AND
                "fees" ? 'feeFulfill' AND
                "fees" ? 'feeSend' AND
                jsonb_typeof("fees"->'feeFulfill') = 'number' AND
                jsonb_typeof("fees"->'feeSend') = 'number'
            )
        `);

        // Add check constraints for positive values
        await queryRunner.query(`
            ALTER TABLE "tokens" 
            ADD CONSTRAINT "CHK_tokens_decimal_positive" 
            CHECK ("decimal" > 0)
        `);


        await queryRunner.query(`
            ALTER TABLE "bridge_infos" 
            ADD CONSTRAINT "CHK_bridge_infos_tokenDecimal_positive" 
            CHECK ("tokenDecimal" > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop check constraints
        await queryRunner.query(`ALTER TABLE "bridge_infos" DROP CONSTRAINT "CHK_bridge_infos_tokenDecimal_positive"`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "CHK_tokens_decimal_positive"`);
        await queryRunner.query(`ALTER TABLE "bridge_infos" DROP CONSTRAINT "CHK_bridge_infos_fees_structure"`);
        
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_bridge_infos_tokenId"`);
        await queryRunner.query(`DROP INDEX "IDX_bridge_infos_chainId"`);
        await queryRunner.query(`DROP INDEX "IDX_tokens_symbol"`);
        await queryRunner.query(`DROP INDEX "IDX_tokens_chainId"`);
        
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "bridge_infos" DROP CONSTRAINT "FK_bridge_infos_tokenId"`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE "bridge_infos"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
    }
}
