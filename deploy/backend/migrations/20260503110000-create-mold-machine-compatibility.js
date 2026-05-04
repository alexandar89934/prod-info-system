"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.createTable("MoldMachineCompatibility", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      moldId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Molds",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      machineId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Machines",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      cycleTimeSeconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      startupScrapCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      settingParameters: {
        type: Sequelize.JSONB,
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

    await queryInterface.addConstraint("MoldMachineCompatibility", {
      fields: ["moldId", "machineId"],
      type: "unique",
      name: "unique_mold_machine",
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.dropTable("MoldMachineCompatibility");
  },
};