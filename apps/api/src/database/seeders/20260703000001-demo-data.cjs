const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('organizations', [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Spiced Childcare HQ',
        email: 'admin@spiced.ca',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('users', [
      {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'super@spiced.ca',
        password: passwordHash,
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        permissions: '["*"]',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('dayhomes', [
      {
        id: '33333333-3333-4333-8333-333333333333',
        organizationId: '11111111-1111-4111-8111-111111111111',
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
        id: '44444444-4444-4444-8444-444444444444',
        organizationId: '11111111-1111-4111-8111-111111111111',
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
        id: '55555555-5555-4555-8555-555555555555',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        name: 'Infant Room',
        capacity: 4,
        ageGroup: 'INFANT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '66666666-6666-4666-8666-666666666666',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        name: 'Toddler Room',
        capacity: 6,
        ageGroup: 'TODDLER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '77777777-7777-4777-8777-777777777777',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        name: 'Preschool Room',
        capacity: 6,
        ageGroup: 'PRESCHOOL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('educators', [
      {
        id: '88888888-8888-4888-8888-888888888888',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
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
        id: '99999999-9999-4999-8999-999999999999',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
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
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        organizationId: '11111111-1111-4111-8111-111111111111',
        primaryContactName: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '780-555-0201',
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        organizationId: '11111111-1111-4111-8111-111111111111',
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
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        familyId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
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
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        familyId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        firstName: 'Noah',
        lastName: 'Davis',
        dateOfBirth: '2023-08-01',
        gender: 'MALE',
        allergies: [''],
        medicalNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        familyId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
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
        id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        childId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        roomId: '66666666-6666-4666-8666-666666666666',
        startDate: '2024-09-01',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '10101010-1010-4101-8101-101010101010',
        childId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        roomId: '55555555-5555-4555-8555-555555555555',
        startDate: '2025-01-15',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '12121212-1212-4121-8121-121212121212',
        childId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        dayhomeId: '33333333-3333-4333-8333-333333333333',
        roomId: '77777777-7777-4777-8777-777777777777',
        startDate: '2024-09-01',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('attendance_records', [
      {
        id: '13131313-1313-4131-8131-131313131313',
        childId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        checkedInBy: '88888888-8888-4888-8888-888888888888',
        checkInTime: new Date('2026-07-03T08:10:00'),
        checkedOutBy: '88888888-8888-4888-8888-888888888888',
        checkOutTime: new Date('2026-07-03T16:30:00'),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '14141414-1414-4141-8141-141414141414',
        childId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        checkedInBy: '88888888-8888-4888-8888-888888888888',
        checkInTime: new Date('2026-07-03T08:25:00'),
        checkedOutBy: '99999999-9999-4999-8999-999999999999',
        checkOutTime: new Date('2026-07-03T16:00:00'),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('organization_settings', [
      {
        id: '99999999-9999-4999-8999-999999999999',
        organizationId: '11111111-1111-4111-8111-111111111111',
        operatingHours: JSON.stringify({
          monday: { open: '07:00', close: '18:00' },
          tuesday: { open: '07:00', close: '18:00' },
          wednesday: { open: '07:00', close: '18:00' },
          thursday: { open: '07:00', close: '18:00' },
          friday: { open: '07:00', close: '18:00' },
        }),
        holidays: JSON.stringify([
          { date: '2026-12-25', name: 'Christmas Day', type: 'PUBLIC' },
          { date: '2026-12-26', name: 'Boxing Day', type: 'PUBLIC' },
          { date: '2027-01-01', name: "New Year's Day", type: 'PUBLIC' },
        ]),
        ratios: JSON.stringify({
          AB: { infant: 3, toddler: 5, preschool: 8, schoolAge: 15 },
        }),
        ratioBreachBehavior: 'WARN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    const tables = [
      'attendance_records',
      'enrollments',
      'children',
      'families',
      'educators',
      'rooms',
      'organization_settings',
      'dayhomes',
      'users',
      'organizations',
    ];
    for (const table of tables) {
      await queryInterface.bulkDelete(table, {}, {});
    }
  },
};
