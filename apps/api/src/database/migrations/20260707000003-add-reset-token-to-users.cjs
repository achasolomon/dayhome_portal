module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'resetToken', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('users', 'resetTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'resetTokenExpiry');
    await queryInterface.removeColumn('users', 'resetToken');
  },
};
