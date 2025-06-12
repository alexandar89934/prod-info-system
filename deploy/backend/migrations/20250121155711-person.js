"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );
    await queryInterface.createTable("Person", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        type: Sequelize.UUID,
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
      startDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      endDate: {
        allowNull: true,
        type: Sequelize.DATE,
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

  async down(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.dropTable("Person", {
      cascade: true,
    });
  },
};
