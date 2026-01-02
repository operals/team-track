'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FileText, Upload, X, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiFileUploadProps {
  value?: (File | string)[]
  onChange?: (files: (File | string)[]) => void
  name?: string
  label?: string
  placeholder?: string
  className?: string
  maxFiles?: number
  accept?: string
}

export function MultiFileUpload({
  value = [],
  onChange,
  name = 'documents',
  label = 'Documents',
  placeholder = 'Upload documents',
  className,
  maxFiles = 10,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
}: MultiFileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const remainingSlots = maxFiles - value.length
      const filesToAdd = files.slice(0, remainingSlots)
      onChange?.([...value, ...filesToAdd])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange?.(newFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getFileName = (file: File | string | any): string => {
    // Check if it's a Media object with filename
    if (typeof file === 'object' && file !== null && 'filename' in file) {
      return file.filename
    }
    // Check if it's a File object by checking for properties
    if (typeof file === 'object' && file !== null && 'name' in file) {
      return file.name
    }
    // Extract filename from URL or ID
    if (typeof file === 'string') {
      // If it's a URL, get the last part
      const parts = file.split('/')
      return parts[parts.length - 1] || 'Document'
    }
    return 'Document'
  }

  const getFileSize = (file: File | string | any): string => {
    // Check if it's a Media object with filesize
    if (typeof file === 'object' && file !== null && 'filesize' in file) {
      const bytes = file.filesize
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }
    // Check if it's a File object by checking for properties
    if (typeof file === 'object' && file !== null && 'size' in file) {
      const bytes = file.size
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }
    return ''
  }

  const isFileObject = (file: File | string | any): file is File => {
    return (
      typeof file === 'object' &&
      file !== null &&
      ('name' in file || 'filename' in file) &&
      ('size' in file || 'filesize' in file)
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-md border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getFileName(file)}</p>
                  {isFileObject(file) && (
                    <p className="text-xs text-muted-foreground">{getFileSize(file)}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxFiles && (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-md hover:border-muted-foreground/50 transition-colors cursor-pointer"
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
          <p className="text-xs text-muted-foreground">
            {value.length} / {maxFiles} files uploaded
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden inputs for files to be submitted with form */}
      {value.map((file, index) => {
        // Only add File objects (with 'name' property) to DataTransfer
        // Media objects (with 'filename') and strings will be handled separately
        if (isFileObject(file) && 'name' in file && typeof file.name === 'string') {
          return (
            <input
              key={`file-${index}`}
              type="file"
              name={`${name}[${index}]`}
              className="hidden"
              ref={(input) => {
                if (input) {
                  const dataTransfer = new DataTransfer()
                  dataTransfer.items.add(file as File)
                  input.files = dataTransfer.files
                }
              }}
            />
          )
        }
        // For Media objects and string IDs, create hidden inputs with the ID
        if (typeof file === 'object' && file !== null && 'id' in file) {
          return (
            <input
              key={`doc-${index}`}
              type="hidden"
              name={`${name}[${index}]`}
              value={String((file as any).id)}
            />
          )
        }
        if (typeof file === 'string') {
          return (
            <input key={`doc-${index}`} type="hidden" name={`${name}[${index}]`} value={file} />
          )
        }
        return null
      })}

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max {maxFiles} files)
      </p>
    </div>
  )
}
