"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );
    await queryInterface.createTable("EmployeeWorkplaces", {
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      workplaceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Workplace",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.dropTable("EmployeeWorkplaces");
  },
};
