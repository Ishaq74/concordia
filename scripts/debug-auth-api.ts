import { getAuth } from '../src/lib/auth/auth'

async function run() {
  const auth = await getAuth()
  console.log('api methods:', Object.keys((auth as any).api).sort())
}

run().catch(e => { console.error(e); process.exit(1) })