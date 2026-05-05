"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`
      CREATE TYPE "item_category" AS ENUM (
        'raw_material', 'masterbatch', 'component',
        'semi_finished', 'finished_good', 'regrind', 'packaging'
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "item_unit" AS ENUM ('g', 'kg', 'kom', 'm', 'm2');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "item_approval_level" AS ENUM ('qc_controller', 'shift_manager');
    `);

    await queryInterface.createTable("Items", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      itemCode: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      name: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.ENUM("raw_material","masterbatch","component","semi_finished","finished_good","regrind","packaging"), allowNull: false },
      unit: { type: Sequelize.ENUM("g","kg","kom","m","m2"), allowNull: false },
      priceEurPerUnit: { type: Sequelize.DECIMAL(12, 4), allowNull: true },
      approvalLevel: { type: Sequelize.ENUM("qc_controller","shift_manager"), allowNull: true },
      toolId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "Molds", key: "id" },
        onDelete: "SET NULL",
      },
      pictures: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      documents: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("Items");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "item_approval_level";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "item_unit";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "item_category";`);
  },
};