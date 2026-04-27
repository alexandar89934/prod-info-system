"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Machines"
      ALTER COLUMN "machineNumber" TYPE INTEGER
      USING "machineNumber"::INTEGER
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Machines"
      ALTER COLUMN "machineNumber" TYPE TEXT
      USING "machineNumber"::TEXT
    `);
  },
};