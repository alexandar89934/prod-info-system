"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "JobPositionResponsibilities" (
        id SERIAL PRIMARY KEY,
        "jobPositionId" INTEGER NOT NULL REFERENCES "JobPosition"(id) ON DELETE CASCADE,
        "responsibilityCode" VARCHAR(100) NOT NULL REFERENCES "Responsibility"(code) ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE ("jobPositionId", "responsibilityCode")
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      `DROP TABLE IF EXISTS "JobPositionResponsibilities";`
    );
  },
};