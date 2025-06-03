import React from 'react'
import { Loader2 } from 'lucide-react'

const Propose = () => {
  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='mb-8 text-6xl font-bold text-[#B4F481]'>PROPOSE</h1>
          <div className='flex flex-col items-center justify-center rounded-lg bg-gray-900/50 p-12'>
            <Loader2 className='mb-4 h-12 w-12 animate-spin text-[#B4F481]' />
            <p className='text-xl text-gray-400'>Coming Soon</p>
            <p className='mt-2 text-gray-500'>
              Submit and vote on proposals to shape the future of Regen Bazaar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Original component: Propose;
// Auto-generated App Router page wrapper
// Original file: Propose.tsx
// Generated: 2025-05-30T01:49:22.852Z

export default function Page() {
  return <Propose />
}
