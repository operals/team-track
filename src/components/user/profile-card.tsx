'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import type { User } from '@/payload-types'
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
      ? user.departments.map((dept) => (typeof dept === 'object' ? dept.name : dept))
      : ['No department']

  const role =
    typeof user.role === 'object' && user.role && 'name' in user.role
      ? (user.role as { name: string }).name
      : user.role || 'No role'

  const photo =
    typeof user.photo === 'object' && user.photo && 'url' in user.photo
      ? (user.photo as { url: string }).url
      : ''

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start md:flex-row md:space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={photo} alt={user.fullName} className="object-cover" />
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
              <div className='text-sm'>
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
                {formatDate(user.birthDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
