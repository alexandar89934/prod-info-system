"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TABLE "LeaveBalance" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "personId" UUID NOT NULL REFERENCES "Person"(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        "totalVacationDays" DECIMAL(5, 1) NOT NULL DEFAULT 20,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE ("personId", year)
      );
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "LeaveBalance";`);
  },
};