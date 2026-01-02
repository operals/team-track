'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputField } from '@/components/form/input-field'
import { BirthdatePicker } from '@/components/date-pickers/birthdate-picker'
import { JoinedDatePicker } from '@/components/date-pickers/joined-date-picker'
import { Spinner } from '@/components/ui/spinner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '@/lib/countries'
import { SelectField } from '@/components/form/select-field'

// Simplified schema for public signup
const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    primaryPhone: z.string().min(1, 'Phone number is required'),
    birthDate: z.string().min(1, 'Birth date is required'),
    joinedAt: z.string().min(1, 'Joined date is required'),
    nationality: z.string().optional(),
    identityNumber: z.string().optional(),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function UserSignupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      primaryPhone: '',
      birthDate: '',
      joinedAt: '',
      nationality: '',
      identityNumber: '',
      address: '',
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      toast.success('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>

          <InputField
            label="Full Name *"
            name="fullName"
            register={register}
            error={errors.fullName?.message}
          />

          <InputField
            label="Email *"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
          />

          <InputField
            label="Primary Phone *"
            name="primaryPhone"
            type="tel"
            register={register}
            error={errors.primaryPhone?.message}
          />

          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <BirthdatePicker
                label="Birth Date *"
                value={field.value}
                onValueChange={field.onChange}
                error={errors.birthDate?.message}
              />
            )}
          />

          <Controller
            name="joinedAt"
            control={control}
            render={({ field }) => (
              <JoinedDatePicker
                label="Joined Date *"
                value={field.value}
                onValueChange={field.onChange}
                error={errors.joinedAt?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Account Credentials */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Account Credentials</h3>

          <InputField
            label="Username *"
            name="username"
            register={register}
            error={errors.username?.message}
          />

          <InputField
            label="Password *"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
          />

          <InputField
            label="Confirm Password *"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword?.message}
          />
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>

          <SelectField
            control={control}
            name={'nationality'}
            label="Nationality"
            placeholder="Select nationality"
            options={COUNTRIES}
            searchable={true}
          />

          <InputField
            label="Identity Number"
            name="identityNumber"
            register={register}
          />

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <textarea
              id="address"
              {...register('address')}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Login here
        </a>
      </div>
    </form>
  )
}
