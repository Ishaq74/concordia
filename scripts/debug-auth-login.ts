import { createTestUser, loginTestUser, generateUniqueEmail, generateUniqueUsername, generateSecurePassword } from '../tests/utils/auth-test-utils'

async function run() {
  const creds = {
    email: generateUniqueEmail('dbg'),
    username: generateUniqueUsername(),
    password: generateSecurePassword(),
  }
  await createTestUser({ email: creds.email, username: creds.username, password: creds.password, emailVerified: true })
  const res = await loginTestUser(creds.email, creds.password)
  console.log('login result:', { token: res.token ? res.token.slice(0, 50) + '...' : res.token, user: res.user?.id })
}

run().catch(err => { console.error(err); process.exit(1) })