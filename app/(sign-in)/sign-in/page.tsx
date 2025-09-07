'use client'

import SignInForm from '@/components/auth/forms/sign-in-form'

export default function SignInPage() {
  return (
    <div className="flex flex-col justify-center w-full px-4 sm:px-6 py-6 sm:py-8">
      <SignInForm/>
    </div>
  )
}