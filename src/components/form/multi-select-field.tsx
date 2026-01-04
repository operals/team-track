'use client'

import * as React from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Option {
  value: string
  label: string
}

interface MultiSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  placeholder?: string
  options: Option[]
  error?: string
}

export function MultiSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select options...',
  options,
  error,
}: MultiSelectFieldProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  return (
    <div>
      {label && (
        <Label htmlFor={String(name)} className="mb-2 block">
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selectedValues = (field.value as string[]) || []

          const filteredOptions = options.filter(
            (option) =>
              !searchQuery || option.label.toLowerCase().includes(searchQuery.toLowerCase()),
          )

          const handleSelect = (value: string) => {
            const newValues = selectedValues.includes(value)
              ? selectedValues.filter((v) => v !== value)
              : [...selectedValues, value]
            field.onChange(newValues)
          }

          const handleRemove = (value: string) => {
            const newValues = selectedValues.filter((v) => v !== value)
            field.onChange(newValues)
          }

          return (
            <div className="space-y-2">
              {/* Hidden inputs for form submission */}
              {selectedValues.map((value, index) => (
                <input
                  key={`${String(name)}-${index}`}
                  type="hidden"
                  name={`${String(name)}[${index}]`}
                  value={value}
                />
              ))}

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      'w-full justify-between',
                      error && 'border-destructive',
                      !selectedValues.length && 'text-muted-foreground',
                    )}
                  >
                    {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No options found.
                      </div>
                    ) : (
                      filteredOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value)
                        return (
                          <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                              'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                              isSelected && 'bg-accent',
                            )}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {option.label}
                          </div>
                        )
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Display selected items as badges */}
              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((value) => {
                    const option = options.find((opt) => opt.value === value)
                    if (!option) return null
                    return (
                      <Badge key={value} variant="secondary" className="gap-1">
                        {option.label}
                        <button
                          type="button"
                          onClick={() => handleRemove(value)}
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}
