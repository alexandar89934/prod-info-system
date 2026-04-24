"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.createTable("MachineEquipment", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      model: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      serialNumber: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "MachineEquipmentTypes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      documents: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      pictures: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      updatedBy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.dropTable("MachineEquipment");
  },
};
