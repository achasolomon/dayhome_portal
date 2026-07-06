const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('invitations', 'firstName', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('invitations', 'lastName', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('invitations', 'phone', {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('invitations', 'firstName');
    await queryInterface.removeColumn('invitations', 'lastName');
    await queryInterface.removeColumn('invitations', 'phone');
  },
};
