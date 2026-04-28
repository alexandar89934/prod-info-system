"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.addColumn("Person", "rfidCardNumber", {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("Person", "status", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "off",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Person"
        ADD CONSTRAINT "person_status_check"
        CHECK (status IN ('working', 'off', 'vacation', 'sick', 'break'));
    `);

    await queryInterface.addColumn("Person", "currentPositionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "JobPosition", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      ALTER TABLE "Person" DROP CONSTRAINT IF EXISTS "person_status_check";
    `);
    await queryInterface.removeColumn("Person", "currentPositionId");
    await queryInterface.removeColumn("Person", "status");
    await queryInterface.removeColumn("Person", "rfidCardNumber");
  },
};