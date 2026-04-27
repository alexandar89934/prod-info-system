"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterfaceOrObject, Sequelize) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.addColumn("Machines", "yearOfManufacture", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "clampingForce", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "injectionWeight", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "minMoldThickness", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "maxMoldThickness", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "centeringRingFixedSide", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "centeringRingMovingSide", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Machines", "controlSystem", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.removeColumn("Machines", "yearOfManufacture");
    await queryInterface.removeColumn("Machines", "clampingForce");
    await queryInterface.removeColumn("Machines", "injectionWeight");
    await queryInterface.removeColumn("Machines", "minMoldThickness");
    await queryInterface.removeColumn("Machines", "maxMoldThickness");
    await queryInterface.removeColumn("Machines", "centeringRingFixedSide");
    await queryInterface.removeColumn("Machines", "centeringRingMovingSide");
    await queryInterface.removeColumn("Machines", "controlSystem");
  },
};