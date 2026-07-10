module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('organizations', 'type', {
      type: Sequelize.ENUM('system', 'dayhome', 'parent'),
      defaultValue: 'dayhome',
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('organizations', 'type');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_organizations_type";',
    );
  },
};
