"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.createTable("ItemPackaging", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      itemId: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "Items", key: "id" }, onDelete: "CASCADE",
      },
      packagingUnitId: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "PackagingUnits", key: "id" }, onDelete: "CASCADE",
      },
      quantityPerUnit: { type: Sequelize.INTEGER, allowNull: false },
      pictures: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "ItemPackaging" ADD CONSTRAINT "item_packaging_unique" UNIQUE ("itemId", "packagingUnitId");`
    );
  },
  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("ItemPackaging");
  },
};