"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TYPE "production_plan_status" AS ENUM ('queued', 'in_progress', 'done', 'cancelled');
    `);

    await queryInterface.createTable("ProductionPlan", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      customerOrderLineId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "CustomerOrderLines", key: "id" },
        onDelete: "SET NULL",
      },
      itemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Items", key: "id" },
        onDelete: "RESTRICT",
      },
      machineId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Machines", key: "id" },
        onDelete: "RESTRICT",
      },
      moldId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "Molds", key: "id" },
        onDelete: "SET NULL",
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      expectedStartDate: { type: Sequelize.DATEONLY, allowNull: true },
      expectedEndDate: { type: Sequelize.DATEONLY, allowNull: true },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      status: {
        type: Sequelize.ENUM("queued", "in_progress", "done", "cancelled"),
        allowNull: false,
        defaultValue: "queued",
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("ProductionPlan");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "production_plan_status";`);
  },
};