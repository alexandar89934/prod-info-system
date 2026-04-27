"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeWorkplaces" RENAME TO "EmployeeJobPositions";`
    );
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'EmployeeJobPositions' AND column_name = 'workplaceId'
        ) THEN
          ALTER TABLE "EmployeeJobPositions" RENAME COLUMN "workplaceId" TO "jobPositionId";
        END IF;
      END $$;
    `);
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "Workplace" RENAME TO "JobPosition";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "WorkplaceCategory" RENAME TO "JobPositionCategory";`
    );
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "JobPositionCategory" RENAME TO "WorkplaceCategory";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "JobPosition" RENAME TO "Workplace";`
    );
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'EmployeeJobPositions' AND column_name = 'jobPositionId'
        ) THEN
          ALTER TABLE "EmployeeJobPositions" RENAME COLUMN "jobPositionId" TO "workplaceId";
        END IF;
      END $$;
    `);
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeJobPositions" RENAME TO "EmployeeWorkplaces";`
    );
  },
};