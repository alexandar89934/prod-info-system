"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(`CREATE SEQUENCE IF NOT EXISTS customer_orders_number_seq START 1;`);

    await queryInterface.sequelize.query(`
      CREATE TYPE "customer_order_status" AS ENUM ('open', 'in_plan', 'fulfilled');
    `);

    await queryInterface.createTable("CustomerOrders", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      orderNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.literal(`'CO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('customer_orders_number_seq')::text, 4, '0')`),
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onDelete: "RESTRICT",
      },
      deliveryDate: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM("open", "in_plan", "fulfilled"),
        allowNull: false,
        defaultValue: "open",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("CustomerOrders");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "customer_order_status";`);
    await queryInterface.sequelize.query(`DROP SEQUENCE IF EXISTS customer_orders_number_seq;`);
  },
};