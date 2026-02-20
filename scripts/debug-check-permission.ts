import { checkPermission, hasPermission } from '../src/lib/auth/permissions'

async function run() {
  console.log('citizen -> update_own_profile =>', await checkPermission('user' as any, 'update_own_profile' as any))
  console.log('hasPermission(citizen, update_own_profile) =>', hasPermission(['citizen'], 'update_own_profile' as any))

  console.log('owner -> manage_organization =>', await checkPermission('owner' as any, 'manage_organization' as any))
  console.log('hasPermission(owner, manage_organization) =>', hasPermission(['owner'], 'manage_organization' as any))

  console.log('owner -> update_resource with own context =>', await checkPermission('owner' as any, 'update_resource' as any, { resourceOwnerId: 'u1', userId: 'u1' }))
  console.log('member -> read_project with same org =>', await checkPermission('member' as any, 'read_project' as any, { userId: 'u1', orgId: 'o1', resourceOrgId: 'o1' }))
}

run().catch(err => { console.error('Error:', err); process.exit(1) })
