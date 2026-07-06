const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('invitations', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM('ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY'),
        allowNull: false,
        defaultValue: 'ORG_MANAGER',
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      acceptedAt: { type: DataTypes.DATE },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('invitations');
  },
};
