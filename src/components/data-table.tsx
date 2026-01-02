'use client'

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import * as React from 'react'

interface Column<T> {
  key: keyof T
  header: string
  render?: (value: unknown, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actionColumn?: (item: T) => React.ReactNode
  className?: string
  enablePagination?: boolean
  initialPageSize?: number
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actionColumn,
  className = '',
  enablePagination = true,
  initialPageSize = 20,
}: DataTableProps<T>) {
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const start = enablePagination ? safePageIndex * pageSize : 0
  const end = enablePagination ? start + pageSize : data.length
  const rows = data.slice(start, end)

  React.useEffect(() => {
    // If data size shrinks and page index is out of range, clamp it
    const newPageCount = Math.max(1, Math.ceil(data.length / pageSize))
    if (pageIndex > newPageCount - 1) setPageIndex(newPageCount - 1)
  }, [data.length, pageIndex, pageSize])

  const canPrev = safePageIndex > 0
  const canNext = safePageIndex < pageCount - 1

  return (
    <>
      <div className={`overflow-hidden rounded-lg border ${className}`}>
        {/* Future: Add filters and search here */}

        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.header}</TableHead>
              ))}
              {actionColumn && <TableHead className="w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '-')}
                  </TableCell>
                ))}
                {actionColumn && <TableCell>{actionColumn(item)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <div className="flex flex-row items-center justify-between gap-4 px-4 py-3 mt-3">
          {/* Left side: Rows per page + Showing text */}
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="w-20" size="sm">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {Math.min(end, data.length)} of {data.length} item
              {data.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Right side: Page info + Navigation buttons */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">
              Page {safePageIndex + 1} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPageIndex(0)}
                disabled={!canPrev}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
                disabled={!canNext}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={!canNext}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
