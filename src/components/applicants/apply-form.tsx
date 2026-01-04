'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ApplyForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedInUrl: '',
    portfolioUrl: '',
    positionAppliedFor: '',
    yearsOfExperience: '',
    educationLevel: '',
    currentEmploymentStatus: '',
    expectedSalary: '',
    availabilityDate: '',
    source: '',
    bio: '',
    consentToDataStorage: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        toast.error('Invalid file type. Please upload a PDF file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. File size must be less than 5MB')
        return
      }
      setCvFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.consentToDataStorage) {
      toast.error('Please consent to data storage to continue')
      return
    }

    if (!cvFile) {
      toast.error('Please upload your CV')
      return
    }

    setIsSubmitting(true)

    try {
      // Submit everything to the apply endpoint in one request
      const submitFormData = new FormData()

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          submitFormData.append(key, String(value))
        }
      })

      // Add CV file
      submitFormData.append('cv', cvFile)

      const response = await fetch('/api/apply', {
        method: 'POST',
        body: submitFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit application')
      }

      toast.success(
        'Application submitted! Thank you for your application. We will review it and get back to you soon.',
      )

      // Redirect to success page
      router.push('/apply/success')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Submission failed. Please try again or contact support',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Fill in your details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+90 5xx xxx xx xx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedInUrl">LinkedIn Profile (Optional)</Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  value={formData.linkedInUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio / Website (Optional)</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="positionAppliedFor">
                  Position Applied For <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="positionAppliedFor"
                  name="positionAppliedFor"
                  value={formData.positionAppliedFor}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Software Engineer, HR Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">
                  Years of Experience <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="educationLevel">
                  Education Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) => handleSelectChange('educationLevel', value)}
                  required
                >
                  <SelectTrigger id="educationLevel">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="associate">Associate Degree</SelectItem>
                    <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                    <SelectItem value="master">Master&apos;s Degree</SelectItem>
                    <SelectItem value="phd">Doctorate (PhD)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentEmploymentStatus">
                  Employment Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currentEmploymentStatus}
                  onValueChange={(value) => handleSelectChange('currentEmploymentStatus', value)}
                  required
                >
                  <SelectTrigger id="currentEmploymentStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="notice-period">Notice Period</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Monthly Salary (Optional)</Label>
                <Input
                  id="expectedSalary"
                  name="expectedSalary"
                  type="number"
                  min="0"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availabilityDate">Availability Date</Label>
                <Input
                  id="availabilityDate"
                  name="availabilityDate"
                  type="date"
                  value={formData.availabilityDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">How did you hear about us?</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleSelectChange('source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="job-board">Job Board</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cover Letter</h3>
            <div className="space-y-2">
              <Label htmlFor="bio">
                Tell us about yourself <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Introduce yourself and explain why you're interested in this position..."
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resume / CV</h3>
            <div className="space-y-2">
              <Label htmlFor="cv">
                Upload CV (PDF only) <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {cvFile && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Upload className="h-3 w-3" />
                    {cvFile.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 5MB. PDF format only.
              </p>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consentToDataStorage"
                checked={formData.consentToDataStorage}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, consentToDataStorage: checked as boolean }))
                }
                required
              />
              <div className="space-y-1">
                <Label
                  htmlFor="consentToDataStorage"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I consent to the storage and processing of my personal data for recruitment
                  purposes <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your data will be stored securely and used only for recruitment purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
