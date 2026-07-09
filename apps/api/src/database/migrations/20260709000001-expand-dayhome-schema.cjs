const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Change status enum — remove PENDING, REJECTED; keep ACTIVE, SUSPENDED, CLOSED
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_dayhomes_status" RENAME TO "enum_dayhomes_status_old";`,
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_dayhomes_status" AS ENUM('ACTIVE', 'SUSPENDED', 'CLOSED');`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" DROP DEFAULT;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" TYPE "enum_dayhomes_status" USING "status"::text::"enum_dayhomes_status";`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_dayhomes_status_old";`,
    );

    // Add new columns to dayhomes
    await queryInterface.addColumn('dayhomes', 'ownerId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('dayhomes', 'externalId', {
      type: DataTypes.STRING(50),
      unique: true,
    });

    await queryInterface.addColumn('dayhomes', 'rawPayload', {
      type: DataTypes.JSONB,
    });

    await queryInterface.addColumn('dayhomes', 'educatorFirstName', {
      type: DataTypes.STRING(100),
    });

    await queryInterface.addColumn('dayhomes', 'educatorLastName', {
      type: DataTypes.STRING(100),
    });

    await queryInterface.addColumn('dayhomes', 'educatorEmail', {
      type: DataTypes.STRING(255),
    });

    await queryInterface.addColumn('dayhomes', 'educatorPhone', {
      type: DataTypes.STRING(20),
    });

    await queryInterface.addColumn('dayhomes', 'addressLine1', {
      type: DataTypes.STRING(255),
    });

    await queryInterface.addColumn('dayhomes', 'addressCity', {
      type: DataTypes.STRING(100),
    });

    await queryInterface.addColumn('dayhomes', 'addressProvince', {
      type: DataTypes.STRING(2),
    });

    await queryInterface.addColumn('dayhomes', 'addressPostalCode', {
      type: DataTypes.STRING(7),
    });

    await queryInterface.addColumn('dayhomes', 'addressFull', {
      type: DataTypes.TEXT,
    });

    await queryInterface.addColumn('dayhomes', 'homeType', {
      type: DataTypes.ENUM('house', 'apartment', 'townhouse', 'other'),
    });

    await queryInterface.addColumn('dayhomes', 'homeOwnership', {
      type: DataTypes.ENUM('own', 'rent', 'other'),
    });

    await queryInterface.addColumn('dayhomes', 'fencedBackyard', {
      type: DataTypes.BOOLEAN,
    });

    await queryInterface.addColumn('dayhomes', 'smokingStatus', {
      type: DataTypes.ENUM('yes', 'no', 'outdoor_only'),
    });

    await queryInterface.addColumn('dayhomes', 'hasPets', {
      type: DataTypes.BOOLEAN,
    });

    await queryInterface.addColumn('dayhomes', 'homeResidentsCount', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'eveningOvernightCare', {
      type: DataTypes.BOOLEAN,
    });

    await queryInterface.addColumn('dayhomes', 'currentCapacity', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'maximumCapacity', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'operatingHoursStart', {
      type: DataTypes.TIME,
    });

    await queryInterface.addColumn('dayhomes', 'operatingHoursEnd', {
      type: DataTypes.TIME,
    });

    await queryInterface.addColumn('dayhomes', 'childcareLevel', {
      type: DataTypes.STRING(100),
    });

    await queryInterface.addColumn('dayhomes', 'languagesSpoken', {
      type: DataTypes.STRING(255),
    });

    await queryInterface.addColumn('dayhomes', 'childcareEducation', {
      type: DataTypes.TEXT,
    });

    await queryInterface.addColumn('dayhomes', 'specializations', {
      type: DataTypes.JSONB,
    });

    await queryInterface.addColumn('dayhomes', 'certificateNumber', {
      type: DataTypes.STRING(100),
    });

    await queryInterface.addColumn('dayhomes', 'licenseIssueDate', {
      type: DataTypes.DATE,
    });

    await queryInterface.renameColumn('dayhomes', 'licenseNumber', 'licenseNumber_old');
    await queryInterface.renameColumn('dayhomes', 'licenseExpiry', 'licenseExpiry_old');
    await queryInterface.addColumn('dayhomes', 'licenseExpiryDate', {
      type: DataTypes.DATE,
    });
    await queryInterface.addColumn('dayhomes', 'licenseStatus', {
      type: DataTypes.STRING(20),
    });

    await queryInterface.addColumn('dayhomes', 'portalStatus', {
      type: DataTypes.STRING(50),
    });

    await queryInterface.addColumn('dayhomes', 'submittedAt', {
      type: DataTypes.DATE,
    });

    await queryInterface.addColumn('dayhomes', 'approvedAt', {
      type: DataTypes.DATE,
    });

    await queryInterface.addColumn('dayhomes', 'activatedAt', {
      type: DataTypes.DATE,
    });

    await queryInterface.addColumn('dayhomes', 'nextComplianceDue', {
      type: DataTypes.DATE,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionConductedAt', {
      type: DataTypes.DATE,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionResult', {
      type: DataTypes.ENUM('pass', 'conditional', 'fail'),
    });

    await queryInterface.addColumn('dayhomes', 'inspectionScore', {
      type: DataTypes.DECIMAL(5, 1),
    });

    await queryInterface.addColumn('dayhomes', 'inspectionItemsPassed', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionItemsFailed', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionCriticalFailures', {
      type: DataTypes.INTEGER,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionSummary', {
      type: DataTypes.TEXT,
    });

    await queryInterface.addColumn('dayhomes', 'inspectionInspectorName', {
      type: DataTypes.STRING(255),
    });

    await queryInterface.addColumn('dayhomes', 'profileItems', {
      type: DataTypes.JSONB,
    });

    // Create intake_logs table
    await queryInterface.createTable('intake_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      externalId: { type: DataTypes.STRING(50) },
      idempotencyKey: { type: DataTypes.STRING(255) },
      status: {
        type: DataTypes.ENUM('success', 'flagged_for_review', 'failed'),
        allowNull: false,
      },
      signatureValid: { type: DataTypes.BOOLEAN },
      validationErrors: { type: DataTypes.JSONB },
      rawRequestBody: { type: DataTypes.JSONB },
      responseStatusCode: { type: DataTypes.INTEGER },
      dayhomeId: {
        type: DataTypes.UUID,
        references: { model: 'dayhomes', key: 'id' },
        onDelete: 'SET NULL',
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    // Drop intake_logs table
    await queryInterface.dropTable('intake_logs');

    // Remove all added columns from dayhomes
    const columns = [
      'ownerId', 'externalId', 'rawPayload',
      'educatorFirstName', 'educatorLastName', 'educatorEmail', 'educatorPhone',
      'addressLine1', 'addressCity', 'addressProvince', 'addressPostalCode', 'addressFull',
      'homeType', 'homeOwnership', 'fencedBackyard', 'smokingStatus', 'hasPets',
      'homeResidentsCount', 'eveningOvernightCare',
      'currentCapacity', 'maximumCapacity', 'operatingHoursStart', 'operatingHoursEnd',
      'childcareLevel', 'languagesSpoken', 'childcareEducation', 'specializations',
      'certificateNumber', 'licenseIssueDate', 'licenseExpiryDate', 'licenseStatus',
      'portalStatus',
      'submittedAt', 'approvedAt', 'activatedAt', 'nextComplianceDue',
      'inspectionConductedAt', 'inspectionResult', 'inspectionScore',
      'inspectionItemsPassed', 'inspectionItemsFailed', 'inspectionCriticalFailures',
      'inspectionSummary', 'inspectionInspectorName',
      'profileItems',
    ];

    for (const col of columns) {
      try {
        await queryInterface.removeColumn('dayhomes', col);
      } catch {
        // Column may not exist — ignore
      }
    }

    // Restore old status enum
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_dayhomes_status" RENAME TO "enum_dayhomes_status_new";`,
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_dayhomes_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'CLOSED');`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" DROP DEFAULT;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" TYPE "enum_dayhomes_status" USING "status"::text::"enum_dayhomes_status";`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "dayhomes" ALTER COLUMN "status" SET DEFAULT 'PENDING';`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_dayhomes_status_new";`,
    );

    // Restore old license columns
    try {
      await queryInterface.removeColumn('dayhomes', 'licenseNumber_old');
      await queryInterface.removeColumn('dayhomes', 'licenseExpiry_old');
    } catch {
      // May not exist
    }
  },
};
