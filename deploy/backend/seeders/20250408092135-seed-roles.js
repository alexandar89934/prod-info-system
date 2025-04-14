"use strict";
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../tools/env/backend.dev.env"),
});

const { ROLES } = process.env;
const rolesArray = ROLES ? ROLES.split(",") : [];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    if (rolesArray.length > 0) {
      const existingRoles = await queryInterface.sequelize.query(
        `SELECT "name" FROM "Role" WHERE "name" IN (:roleNames)`,
        {
          replacements: { roleNames: rolesArray },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      );
      const existingRoleNames = existingRoles.map((role) => role.name);
      const rolesToInsert = rolesArray.filter(
        (role) => !existingRoleNames.includes(role),
      );

      if (rolesToInsert.length > 0) {
        const rolesData = rolesToInsert.map((role) => ({
          name: role,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        await queryInterface.bulkInsert("Role", rolesData, {});
      }
    }
  },

  down: async (queryInterface, Sequelize) => {},
};
