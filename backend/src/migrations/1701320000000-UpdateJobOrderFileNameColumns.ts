import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateJobOrderFileNameColumns1701320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change poFileName from varchar(255) to text
    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "poFileName" TYPE text
    `);

    // Change ivFileName from varchar(255) to text
    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "ivFileName" TYPE text
    `);

    // Change itFileName from varchar(255) to text
    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "itFileName" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to varchar(255)
    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "poFileName" TYPE varchar(255)
    `);

    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "ivFileName" TYPE varchar(255)
    `);

    await queryRunner.query(`
      ALTER TABLE job_orders 
      ALTER COLUMN "itFileName" TYPE varchar(255)
    `);
  }
}
