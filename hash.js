import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function run() {
  const hash = await bcrypt.hash("Password123", SALT_ROUNDS);
  console.log(hash);
}

run();