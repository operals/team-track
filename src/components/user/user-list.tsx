'use client'

import * as React from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Filter } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import type { User } from '@/payload-types'
import { UserTable } from '@/components/user/table'

interface UserListProps {
  data: User[]
}

export function UserList({ data }: UserListProps) {
  const [query, setQuery] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [employmentTypeFilter, setEmploymentTypeFilter] = React.useState<string[]>([])
  const [employmentFilterOpen, setEmploymentFilterOpen] = React.useState(false)

  // Employment type options
  const employmentTypes = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'workPermit', label: 'Work Permit' },
    { value: 'residencePermit', label: 'Residence Permit' },
    { value: 'other', label: 'Other' },
  ]

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // Helper functions for employment type filter
  const handleEmploymentTypeToggle = (value: string) => {
    setEmploymentTypeFilter((prev) =>
      prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value],
    )
  }

  const clearEmploymentTypeFilter = () => {
    setEmploymentTypeFilter([])
  }

  const getEmploymentTypeLabel = (value: string) => {
    return employmentTypes.find((type) => type.value === value)?.label || value
  }

  const filtered = React.useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return data.filter((s) => {
      // Status filter
      if (statusFilter === 'active' && !s.isActive) return false
      if (statusFilter === 'inactive' && s.isActive) return false

      // Employment type filter
      if (employmentTypeFilter.length > 0) {
        const staffEmploymentType = s.employmentType || 'other'
        if (!employmentTypeFilter.includes(staffEmploymentType)) return false
      }

      // Search filter
      const name = s.fullName?.toLowerCase() || ''
      const dept =
        (typeof s.departments === 'object' && s.departments && 'name' in s.departments
          ? (s.departments as any).name
          : ''
        )?.toLowerCase() || ''
      const role =
        (typeof s.role === 'object' && s.role && 'name' in s.role
          ? (s.role as any).name
          : ''
        )?.toLowerCase() || ''
      const email = (s.email || '').toLowerCase()
      if (!q) return true
      return name.includes(q) || dept.includes(q) || role.includes(q) || email.includes(q)
    })
  }, [data, debounced, statusFilter, employmentTypeFilter])

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Team Members</h1>
            <div className="text-sm text-muted-foreground">
              {data.length} total · {filtered.length} shown
            </div>
          </div>

          <div className="sm:block">
            <Link href="/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          {/* Status Filter Buttons */}
          <ButtonGroup className="w-full sm:w-auto">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="flex-1 sm:flex-none"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
              className="flex-1 sm:flex-none"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
              className="flex-1 sm:flex-none"
            >
              Inactive
            </Button>
          </ButtonGroup>

          {/* Search and Filter Group */}
          <div className="flex gap-2">
            {/* Search Input */}
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex"
            />

            {/* Employment Type Filter */}
            <Popover open={employmentFilterOpen} onOpenChange={setEmploymentFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={employmentTypeFilter.length > 0 ? 'border-primary' : ''}
                >
                  <Filter className="h-4 w-4" />
                  {employmentTypeFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {employmentTypeFilter.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Employment Type</h4>
                    {employmentTypeFilter.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearEmploymentTypeFilter}
                        className="h-auto p-1"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {employmentTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`employment-${type.value}`}
                          checked={employmentTypeFilter.includes(type.value)}
                          onCheckedChange={() => handleEmploymentTypeToggle(type.value)}
                        />
                        <label
                          htmlFor={`employment-${type.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {employmentTypeFilter.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Employment Type:</span>
          {employmentTypeFilter.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {getEmploymentTypeLabel(type)}
              <Button
                variant="ghost"
                size="sm"
                className="p-0 w-4 h-4"
                onClick={() => handleEmploymentTypeToggle(type)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <UserTable data={filtered} />
    </div>
  )
}
