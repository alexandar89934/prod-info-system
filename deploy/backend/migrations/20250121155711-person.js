"use strict";
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
      // FIXME: Mozda bi bilo dobro da se ovo prebaci u posebnu tabelu
      // Tipa PersonHistory ili samo EmploymentHistory zavisi sta bismo sve pratii
      // FIXED Ovo shvatam kao sugestiju,ne bih za sad dok ne budem imao jasan use-case. Za sad ostaje samo kao infrmacija kada je neko poceo da radi
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

  async down(queryInterface, Sequelize) {
    queryInterface.context
      ? (queryInterface = queryInterface.context)
      : queryInterface;
    await queryInterface.dropTable("Person", {
      cascade: true,
    });
  },
};
