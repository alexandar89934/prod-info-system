"use strict";

const { Sequelize } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.createTable("Person", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      employeeNumber: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      address: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      mail: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      picture: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      additionalInfo: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      documents: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      updatedBy: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.dropTable("Person", {
      cascade: true,
    });
  },
};
