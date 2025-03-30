"use strict";

const { Sequelize } = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );
    await queryInterface.createTable("User", {
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
      password: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      lastPasswordReset: {
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
    });
    // FIXME: Da nije ovo duplikat, zar nisi mogao samo staviti trigger iz Person migracije?
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_employee_number_update_on_user()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."employeeNumber" <> OLD."employeeNumber"THEN
          RAISE EXCEPTION 'Updating employeeNumber is not allowed';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER prevent_employee_number_update_on_user_trigger
      BEFORE UPDATE ON "User"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_employee_number_update_on_user();
    `);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.dropTable("User", {
      cascade: true,
    });
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_employee_number_update_on_user_trigger ON "User";
      DROP FUNCTION IF EXISTS prevent_employee_number_update_on_user;
    `);
  },
};
