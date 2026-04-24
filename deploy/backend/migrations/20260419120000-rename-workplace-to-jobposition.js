"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeWorkplaces" RENAME TO "EmployeeJobPositions";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeJobPositions" RENAME COLUMN "workplaceId" TO "jobPositionId";`
    );
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
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeJobPositions" RENAME COLUMN "jobPositionId" TO "workplaceId";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS "EmployeeJobPositions" RENAME TO "EmployeeWorkplaces";`
    );
  },
};