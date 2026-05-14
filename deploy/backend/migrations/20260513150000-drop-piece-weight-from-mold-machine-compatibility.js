'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('MoldMachineCompatibility', 'pieceWeightG');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('MoldMachineCompatibility', 'pieceWeightG', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },
};