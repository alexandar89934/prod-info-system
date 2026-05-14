"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlan"
        ALTER COLUMN "expectedStartDate" TYPE TIMESTAMP WITHOUT TIME ZONE
          USING "expectedStartDate"::TIMESTAMP WITHOUT TIME ZONE,
        ALTER COLUMN "expectedEndDate" TYPE TIMESTAMP WITHOUT TIME ZONE
          USING "expectedEndDate"::TIMESTAMP WITHOUT TIME ZONE
    `);
  },
  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.sequelize.query(`
      ALTER TABLE "ProductionPlan"
        ALTER COLUMN "expectedStartDate" TYPE DATE
          USING "expectedStartDate"::DATE,
        ALTER COLUMN "expectedEndDate" TYPE DATE
          USING "expectedEndDate"::DATE
    `);
  },
};