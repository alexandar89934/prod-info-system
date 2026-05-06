"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.createTable("BomLines", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      outputItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Items", key: "id" },
        onDelete: "CASCADE",
      },
      inputItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Items", key: "id" },
        onDelete: "CASCADE",
      },
      quantityPerPiece: { type: Sequelize.DECIMAL(10, 4), allowNull: false },
      unit: { type: Sequelize.ENUM("g", "kg", "kom", "m", "m2"), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "BomLines" ADD CONSTRAINT "bom_lines_output_input_unique" UNIQUE ("outputItemId", "inputItemId");
    `);
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("BomLines");
  },
};