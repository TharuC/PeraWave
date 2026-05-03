import prisma from './src/config/db';

async function test() {
  try {
    console.log('Testing connection to DB...');
    const user = await prisma.user.create({
      data: {
        email: 'test3@eng.pdn.ac.lk',
        password: 'hash',
        fullName: 'Test',
        faculty: 'Eng',
        registrationNumber: 'E/23/041'
      }
    });
    console.log('SUCCESS:', user);
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
