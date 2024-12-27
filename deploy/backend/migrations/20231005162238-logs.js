'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up ( queryInterface) {
    queryInterface.context ? queryInterface = queryInterface.context : queryInterface;
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'); // Use real UUID instead of INTEGER
    await queryInterface.createTable('Log', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        type: Sequelize.UUID
      },
      message: {
        type: Sequelize.TEXT
      },
      stack: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down ( queryInterface) {
    queryInterface.context ? queryInterface = queryInterface.context : queryInterface;
    await queryInterface.dropTable('Log');
  }
};
