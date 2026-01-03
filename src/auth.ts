import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/db'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, credentials.email as string),
          with: {
            role: true,
            departments: {
              with: {
                department: true,
              },
            },
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Don't send password to client
        const { password, ...userWithoutPassword } = user

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.photo,
          isSuperAdmin: user.isSuperAdmin,
          role: user.role,
          departments: user.departments,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isSuperAdmin = (user as any).isSuperAdmin
        token.role = (user as any).role
        token.departments = (user as any).departments
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).isSuperAdmin = token.isSuperAdmin
        ;(session.user as any).role = token.role
        ;(session.user as any).departments = token.departments
      }
      return session
    },
  },
})
