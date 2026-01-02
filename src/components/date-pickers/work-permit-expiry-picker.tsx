'use client'
import { DatePicker } from '@/components/date-picker'

interface WorkPermitExpiryPickerProps {
  value?: string
  label?: string
  onValueChange?: (value: string) => void
  name?: string
  error?: string
}

export function WorkPermitExpiryPicker({
  label = 'Work Permit Expiry',
  ...props
}: WorkPermitExpiryPickerProps) {
  return (
    <DatePicker
      {...props}
      label={label}
      allowPast={false}
      yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 10 }}
    />
  )
}
