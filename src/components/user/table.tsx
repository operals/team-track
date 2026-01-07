'use client'

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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import Link from 'next/link'
import { DataTable } from '../data-table'
import { formatDate } from '@/lib/date-utils'

interface UserTableProps {
  data: User[]
}

const labelMap: Record<string, string> = {
  citizen: 'Citizen',
  workPermit: 'Work Permit',
  residencePermit: 'Residence Permit',
  other: 'Other',
}

export function UserTable({ data }: UserTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const columns = [
    {
      key: 'photo' as keyof User,
      header: 'Image',
      render: (photo: unknown, user: User) => {
        const photoUrl =
          typeof photo === 'object' && photo && 'url' in photo ? (photo as { url: string }).url : ''
        return (
          <Avatar className="h-12 w-12">
            <AvatarImage src={photoUrl} alt={user.fullName} className="object-cover" />
            <AvatarFallback className="text-md">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      key: 'fullName' as keyof User,
      header: 'Full Name',
    },
    {
      key: 'departments' as keyof User,
      header: 'Departments',
      render: (departments: unknown) => {
        if (!departments || !Array.isArray(departments) || departments.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {departments.map((dept, index) => {
              const deptName =
                typeof dept === 'object' && dept && 'name' in dept
                  ? (dept as { name: string }).name
                  : String(dept)
              return (
                <Badge key={index} variant="outline">
                  {deptName}
                </Badge>
              )
            })}
          </div>
        )
      },
    },
    {
      key: 'role' as keyof User,
      header: 'Role',
      render: (role: unknown) =>
        typeof role === 'object' && role && 'name' in role
          ? (role as { name: string }).name
          : String(role || '-'),
    },
    {
      key: 'joinedAt' as keyof User,
      header: 'Joined At',
      render: (date: unknown) => {
        const isValidDate = date === null || typeof date === 'string' || date instanceof Date
        return isValidDate ? formatDate(date as string | Date | null) : '-'
      },
    },
    {
      key: 'employmentType' as keyof User,
      header: 'Employment Type',
      render: (type: unknown) => (
        <Badge>{type ? labelMap[String(type)] || String(type) : '-'}</Badge>
      ),
    },
    {
      key: 'isActive' as keyof User,
      header: 'Status',
      render: (isActive: unknown) => (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ]

  const actionColumn = (user: User) => (
    <div className="flex gap-2">
      <Link href={`/users/${user.id}/edit`}>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </Link>
      <Link href={`/users/${user.id}`}>
        <Button variant="secondary" size="sm">
          View
        </Button>
      </Link>
    </div>
  )

  return <DataTable data={data} columns={columns} actionColumn={actionColumn} />
}
