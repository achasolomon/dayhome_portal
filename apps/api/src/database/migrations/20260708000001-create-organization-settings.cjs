module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organization_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      operatingHours: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      holidays: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      ratios: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      ratioBreachBehavior: {
        type: Sequelize.ENUM('WARN', 'BLOCK'),
        defaultValue: 'WARN',
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('organization_settings', {
      fields: ['organizationId'],
      type: 'unique',
      name: 'uq_organization_settings_org_id',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('organization_settings');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_organization_settings_ratioBreachBehavior";',
    );
  },
};
