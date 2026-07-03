import { QueryInterface } from 'sequelize';
import * as bcrypt from 'bcryptjs';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('organizations', [
      {
        id: 'org-001',
        name: 'Spiced Childcare HQ',
        email: 'admin@spiced.ca',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('users', [
      {
        id: 'user-001',
        email: 'super@spiced.ca',
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('dayhomes', [
      {
        id: 'dh-001',
        organizationId: 'org-001',
        name: 'Little Stars Dayhome',
        address: '123 Maple Street, Edmonton, AB',
        capacity: 16,
        status: 'ACTIVE',
        licenseNumber: 'LIC-2024-001',
        licenseExpiry: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'dh-002',
        organizationId: 'org-001',
        name: 'Sunshine Dayhome',
        address: '456 Oak Avenue, Calgary, AB',
        capacity: 12,
        status: 'PENDING',
        licenseNumber: 'LIC-2024-002',
        licenseExpiry: new Date('2026-10-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('rooms', [
      {
        id: 'room-001',
        dayhomeId: 'dh-001',
        name: 'Infant Room',
        capacity: 4,
        ageGroup: 'INFANT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'room-002',
        dayhomeId: 'dh-001',
        name: 'Toddler Room',
        capacity: 6,
        ageGroup: 'TODDLER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'room-003',
        dayhomeId: 'dh-001',
        name: 'Preschool Room',
        capacity: 6,
        ageGroup: 'PRESCHOOL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('educators', [
      {
        id: 'edu-001',
        dayhomeId: 'dh-001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@spiced.ca',
        phone: '780-555-0101',
        passwordHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'edu-002',
        dayhomeId: 'dh-001',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@spiced.ca',
        phone: '780-555-0102',
        passwordHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('families', [
      {
        id: 'fam-001',
        organizationId: 'org-001',
        primaryContactName: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '780-555-0201',
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'fam-002',
        organizationId: 'org-001',
        primaryContactName: 'James Wilson',
        email: 'james.wilson@example.com',
        phone: '780-555-0202',
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('children', [
      {
        id: 'ch-001',
        familyId: 'fam-001',
        firstName: 'Lily',
        lastName: 'Davis',
        dateOfBirth: '2022-03-15',
        gender: 'FEMALE',
        allergies: ['Peanuts'],
        medicalNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ch-002',
        familyId: 'fam-001',
        firstName: 'Noah',
        lastName: 'Davis',
        dateOfBirth: '2023-08-01',
        gender: 'MALE',
        allergies: [],
        medicalNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ch-003',
        familyId: 'fam-002',
        firstName: 'Emma',
        lastName: 'Wilson',
        dateOfBirth: '2021-11-20',
        gender: 'FEMALE',
        allergies: ['Eggs', 'Dairy'],
        medicalNotes: 'Carries epinephrine auto-injector',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('enrollments', [
      {
        id: 'enr-001',
        childId: 'ch-001',
        dayhomeId: 'dh-001',
        roomId: 'room-002',
        startDate: '2024-09-01',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'enr-002',
        childId: 'ch-002',
        dayhomeId: 'dh-001',
        roomId: 'room-001',
        startDate: '2025-01-15',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'enr-003',
        childId: 'ch-003',
        dayhomeId: 'dh-001',
        roomId: 'room-003',
        startDate: '2024-09-01',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('attendance_records', [
      {
        id: 'att-001',
        childId: 'ch-001',
        checkedInBy: 'edu-001',
        checkInTime: new Date('2026-07-03T08:10:00'),
        checkedOutBy: 'edu-001',
        checkOutTime: new Date('2026-07-03T16:30:00'),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'att-002',
        childId: 'ch-002',
        checkedInBy: 'edu-001',
        checkInTime: new Date('2026-07-03T08:25:00'),
        checkedOutBy: 'edu-002',
        checkOutTime: new Date('2026-07-03T16:00:00'),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    const tables = [
      'attendance_records',
      'enrollments',
      'children',
      'families',
      'educators',
      'rooms',
      'dayhomes',
      'users',
      'organizations',
    ];
    for (const table of tables) {
      await queryInterface.bulkDelete(table, {}, {});
    }
  },
};
