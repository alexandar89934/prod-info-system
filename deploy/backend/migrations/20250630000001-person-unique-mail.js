"use strict";

module.exports = {
  async up(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      'ALTER TABLE "Person" ADD CONSTRAINT "Person_mail_unique" UNIQUE ("mail");'
    );
  },

  async down(queryInterfaceOrObject) {
    const queryInterface =
      queryInterfaceOrObject?.context ?? queryInterfaceOrObject;

    await queryInterface.sequelize.query(
      'ALTER TABLE "Person" DROP CONSTRAINT IF EXISTS "Person_mail_unique";'
    );
  },
};