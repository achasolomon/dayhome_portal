const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
        email: 'admin@spiced.ca',
        password: passwordHash,
        role: 'ORG_ADMIN',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        permissions: '[]',
        organizationId: '11111111-1111-4111-8111-111111111111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
        email: 'manager@spiced.ca',
        password: passwordHash,
        role: 'ORG_MANAGER',
        firstName: 'James',
        lastName: 'Wilson',
        permissions: '[]',
        organizationId: '11111111-1111-4111-8111-111111111111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: ['admin@spiced.ca', 'manager@spiced.ca'],
    });
  },
};
