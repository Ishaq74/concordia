import { createTestUser } from '../tests/utils/auth-test-utils'
import { getAuth } from '../src/lib/auth/auth'

async function run() {
  const { credentials } = await createTestUser({});
  const auth = await getAuth();

  for (let i = 0; i < 5; i++) {
    try {
      await auth.api.signInEmail({ body: { email: credentials.email, password: 'wrong' } })
    } catch (err: any) {
      console.log(`attempt ${i+1} failed:`, err?.body?.message || err.message)
    }
  }

  try {
    await auth.api.signInEmail({ body: { email: credentials.email, password: credentials.password } })
    console.log('6th attempt: sign-in succeeded')
  } catch (err: any) {
    console.log('6th attempt error:', err?.body?.message || err.message)
  }
}

run().catch(e => { console.error(e); process.exit(1) })