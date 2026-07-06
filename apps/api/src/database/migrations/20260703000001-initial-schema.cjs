const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('organizations', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'SUSPENDED'),
        defaultValue: 'ACTIVE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('dayhomes', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      address: { type: DataTypes.TEXT },
      capacity: { type: DataTypes.INTEGER },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'CLOSED'),
        defaultValue: 'PENDING',
      },
      licenseNumber: { type: DataTypes.STRING(100) },
      licenseExpiry: { type: DataTypes.DATE },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('rooms', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dayhomeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false },
      ageGroup: {
        type: DataTypes.ENUM('INFANT', 'TODDLER', 'PRESCHOOL', 'SCHOOL_AGE'),
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('educators', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dayhomeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'CASCADE',
      },
      firstName: { type: DataTypes.STRING(255), allowNull: false },
      lastName: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
      phone: { type: DataTypes.STRING(20) },
      passwordHash: { type: DataTypes.STRING(255) },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'ON_LEAVE', 'TERMINATED'),
        defaultValue: 'ACTIVE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('families', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE',
      },
      primaryContactName: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
      phone: { type: DataTypes.STRING(20) },
      passwordHash: { type: DataTypes.STRING(255) },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('children', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      familyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'families', key: 'id' },
        onDelete: 'CASCADE',
      },
      firstName: { type: DataTypes.STRING(255), allowNull: false },
      lastName: { type: DataTypes.STRING(255), allowNull: false },
      dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
      gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
      },
      allergies: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      medicalNotes: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('enrollments', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'children', key: 'id' },
        onDelete: 'CASCADE',
      },
      dayhomeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'CASCADE',
      },
      roomId: {
        type: DataTypes.UUID,
        references: { model: 'rooms', key: 'id' },
        onDelete: 'SET NULL',
      },
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      endDate: { type: DataTypes.DATEONLY },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'WAITLISTED', 'WITHDRAWN'),
        defaultValue: 'ACTIVE',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('attendance_records', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'children', key: 'id' },
        onDelete: 'CASCADE',
      },
      checkedInBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'educators', key: 'id' },
      },
      checkInTime: { type: DataTypes.DATE, allowNull: false },
      checkedOutBy: {
        type: DataTypes.UUID,
        references: { model: 'educators', key: 'id' },
      },
      checkOutTime: { type: DataTypes.DATE },
      status: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE'),
        defaultValue: 'PRESENT',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable('invoices', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      familyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'families', key: 'id' },
        onDelete: 'CASCADE',
      },
      dayhomeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'CASCADE',
      },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      subsidyAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      paidAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      dueDate: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'),
        defaultValue: 'DRAFT',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('documents', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dayhomeId: {
        type: DataTypes.UUID,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'CASCADE',
      },
      educatorId: {
        type: DataTypes.UUID,
        references: { model: 'educators', key: 'id' },
        onDelete: 'SET NULL',
      },
      documentType: {
        type: DataTypes.ENUM('LICENSE', 'INSURANCE', 'FIRE_INSPECTION', 'HEALTH_INSPECTION', 'FIRST_AID_CERT', 'POLICE_CHECK', 'TRAINING_CERT', 'OTHER'),
        allowNull: false,
      },
      fileUrl: { type: DataTypes.STRING(500), allowNull: false },
      expiryDate: { type: DataTypes.DATEONLY },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SUPERSEDED'),
        defaultValue: 'ACTIVE',
      },
      version: { type: DataTypes.INTEGER, defaultValue: 1 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.createTable('messages', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      threadId: { type: DataTypes.UUID, allowNull: false },
      senderEducatorId: {
        type: DataTypes.UUID,
        references: { model: 'educators', key: 'id' },
        onDelete: 'SET NULL',
      },
      senderFamilyId: {
        type: DataTypes.UUID,
        references: { model: 'families', key: 'id' },
        onDelete: 'SET NULL',
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      action: { type: DataTypes.STRING(100), allowNull: false },
      entity: { type: DataTypes.STRING(100), allowNull: false },
      entityId: { type: DataTypes.UUID, allowNull: false },
      before: { type: DataTypes.JSONB },
      after: { type: DataTypes.JSONB },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY', 'DAYHOME_OWNER', 'EDUCATOR', 'PARENT', 'GOVERNMENT'),
        defaultValue: 'ORG_ADMIN',
        allowNull: false,
      },
      firstName: { type: DataTypes.STRING(100) },
      lastName: { type: DataTypes.STRING(100) },
      permissions: { type: DataTypes.JSONB, defaultValue: [] },
      organizationId: { type: DataTypes.UUID },
      dayhomeId: { type: DataTypes.UUID },
      refreshToken: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE },
    });

    await queryInterface.addIndex('messages', ['threadId']);
    await queryInterface.addIndex('audit_logs', ['userId']);
    await queryInterface.addIndex('audit_logs', ['entity', 'entityId']);
    await queryInterface.addIndex('attendance_records', ['childId']);
    await queryInterface.addIndex('attendance_records', ['checkInTime']);
    await queryInterface.addIndex('enrollments', ['childId']);
    await queryInterface.addIndex('enrollments', ['dayhomeId']);
  },

  down: async (queryInterface) => {
    const tables = [
      'audit_logs',
      'messages',
      'documents',
      'invoices',
      'attendance_records',
      'enrollments',
      'children',
      'families',
      'educators',
      'rooms',
      'dayhomes',
      'organizations',
      'users',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  },
};
