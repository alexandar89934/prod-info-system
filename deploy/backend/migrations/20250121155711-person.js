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
        validate: {
          notNull: true,
        },
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
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_employee_number_update()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."employeeNumber" <> OLD."employeeNumber"THEN
          RAISE EXCEPTION 'Updating employeeNumber is not allowed';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER prevent_employee_number_update_trigger
      BEFORE UPDATE ON "Person"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_employee_number_update();
    `);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.dropTable("Person", {
      cascade: true,
    });

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_employee_number_update_trigger ON "Person";
      DROP FUNCTION IF EXISTS prevent_employee_number_update;
    `);
  },
};
