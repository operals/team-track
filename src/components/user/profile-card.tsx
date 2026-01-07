'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import type { InferSelectModel } from 'drizzle-orm'
import { usersTable } from '@/db/schema'

type User = InferSelectModel<typeof usersTable> & {
  role?: { id: string; name: string } | null
  departments?: Array<{
    id: string
    userId: string
    departmentId: string
    createdAt: string
    department: {
      id: string
      name: string
      isActive: boolean
      createdAt: string
      updatedAt: string
      description: string | null
    }
  }>
}
import { formatDate } from '@/lib/date-utils'
import { CalendarDays } from 'lucide-react'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const departments =
    Array.isArray(user.departments) && user.departments.length > 0
      ? user.departments.map(
          (dept: any) => dept.department?.name || dept.name || 'Unknown department',
        )
      : ['No department']

  const role = user.role?.name || 'No role'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start md:flex-row md:space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photo || ''} alt={user.fullName} className="object-cover" />
            <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.fullName}</h2>
            <p className="text-lg text-muted-foreground">{user.jobTitle || ''}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-muted-foreground">{String(role)}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{String(departments)}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mt-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Login email: </p>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Username: </p>
                <span className="font-medium">{user.username}</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mt-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Joined At: </span>
                <span className="font-medium">{formatDate(user.joinedAt)}</span>
              </div>
            </div>
            <div className="flex flex-row items-center space-x-4 mt-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Birth Date:</span>
                <span className="font-medium">
                  <CalendarDays className="inline-block ml-2 mr-1 h-4 w-4 text-muted-foreground" />
                  {formatDate(user.birthDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
