"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.createTable("Molds", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      inventoryNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cavities: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      requiredClampingForceKN: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      heightMM: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      widthMM: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      depthMM: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      centeringDiameterMM: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      temperingTemperatures: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pictures: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      documents: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("ok", "fault", "repair"),
        allowNull: false,
        defaultValue: "ok",
      },
      pieceCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      serviceCategory: {
        type: Sequelize.ENUM("S-1", "S-2", "S-3", "S-4"),
        allowNull: true,
      },
      notes: {
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

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("Molds");
  },
};
