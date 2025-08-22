import React from 'react'
import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

const Header = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton />
        <SignUpButton>
          <button>
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}

export default Header
