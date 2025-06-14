"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

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
      personId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Person",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
    await queryInterface.sequelize.query(`
  -- Drop the trigger if it exists
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'prevent_employee_number_update_on_user_trigger'
    ) THEN
      DROP TRIGGER prevent_employee_number_update_on_user_trigger ON "User";
    END IF;
  END;
  $$;

  -- Create or replace the function
  CREATE OR REPLACE FUNCTION prevent_employee_number_update_on_user()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW."employeeNumber" <> OLD."employeeNumber" THEN
      RAISE EXCEPTION 'Updating employeeNumber is not allowed';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create the trigger
  CREATE TRIGGER prevent_employee_number_update_on_user_trigger
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_employee_number_update_on_user();
`);
  },

  async down(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.dropTable("User", {
      cascade: true,
    });
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_employee_number_update_on_user_trigger ON "User";
      DROP FUNCTION IF EXISTS prevent_employee_number_update_on_user;
    `);
  },
};
