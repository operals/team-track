import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type AccessGuard = (args: AccessArgs<User>) => boolean

export const authenticated: AccessGuard = ({ req: { user } }) => {
  return Boolean(user)
}

export const superAdminOnly: AccessGuard = ({ req: { user } }) => {
  return Boolean((user as any)?.isSuperAdmin === true)
}
