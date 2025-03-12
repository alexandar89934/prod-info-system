"use strict";

const { Sequelize } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );

    await queryInterface.createTable("RefreshTokens", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        unique: true,
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
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

  async down(queryInterface) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.dropTable("RefreshTokens");
  },
};
