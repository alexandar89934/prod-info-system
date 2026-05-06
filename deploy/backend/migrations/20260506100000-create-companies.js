"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.createTable("Companies", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      pib: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      mb: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      address: { type: Sequelize.STRING(255), allowNull: true },
      phones: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      emails: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      ownerInfo: { type: Sequelize.STRING(255), allowNull: true },
      representative: { type: Sequelize.STRING(255), allowNull: true },
      isOwnCompany: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isCustomer: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isSupplier: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("Companies");
  },
};
