import React from 'react'
import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return (
    <div className="flex justify-center">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none"
            }
          }}
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
    </div>
  )
}

export default SignUpPage