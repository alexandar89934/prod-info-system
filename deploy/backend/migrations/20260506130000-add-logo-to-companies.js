"use strict";

module.exports = {
  up: async (queryInterfaceOrObject, DataTypes) => {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.addColumn("Companies", "logo", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },
  down: async (queryInterfaceOrObject) => {
    const queryInterface = queryInterfaceOrObject?.context ?? queryInterfaceOrObject;
    await queryInterface.removeColumn("Companies", "logo");
  },
};