'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DepartmentList } from '@/components/admin/department-list'
import { DepartmentForm } from '@/components/admin/department-form'
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Department {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userCount: number
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/departments')

      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }

      const data = await response.json()
      setDepartments(data.departments || [])
    } catch (error) {
      toast.error('Failed to load departments')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreateClick = () => {
    setEditingDepartment(null)
    setFormOpen(true)
  }

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchDepartments()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizational departments and assign users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDepartments} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Department
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            {departments.length} department{departments.length !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DepartmentList
              departments={departments}
              onEdit={handleEditClick}
              onRefresh={fetchDepartments}
            />
          )}
        </CardContent>
      </Card>

      <DepartmentForm
        department={editingDepartment}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
