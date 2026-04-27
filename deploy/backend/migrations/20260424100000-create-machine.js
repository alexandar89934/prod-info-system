"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.createTable("Machines", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      machineNumber: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      serialNumber: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
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
      maxMoldWeight: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      maxMoldWidth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      maxMoldHeight: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      serviceInterval: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lastServiceDone: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      automaticMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      semiAutomaticMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      manualMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      workHoursCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pieceCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      scrapCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      workPermit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      availabilityStatusId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "MachineAvailabilityStatuses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.dropTable("Machines");
  },
};