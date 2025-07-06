'use client'

import TweetButton from '../../components/ui/TweetButton'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { getProvider } from '../../lib/web3'

const CreateProject = () => {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
  })

  useEffect(() => {
    const checkWallet = async () => {
      try {
        // Get the current provider instance
        const provider = getProvider()
        if (provider) {
          const accounts = await provider.send('eth_accounts', [])
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0])
          } else {
            toast.error('Please connect your wallet to create a project')
            router.push('/')
          }
        } else {
          toast.error('Please connect your wallet to create a project')
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking wallet:', error)
        router.push('/')
      }
    }

    checkWallet()
  }, [router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress) {
      toast.error('Please connect your wallet to create a project')
      return
    }

    try {
      // First, get or create organization for this wallet
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single()

      let organizationId

      if (orgError) {
        // Create new organization if none exists
        const { data: newOrg, error: createOrgError } = await supabase
          .from('organizations')
          .insert({
            name: `Organization ${walletAddress.slice(0, 6)}`,
            wallet_address: walletAddress,
            type: 'Individual',
            username: `user_${walletAddress.slice(2, 8).toLowerCase()}`,
          })
          .select('id')
          .single()

        if (createOrgError) throw createOrgError
        organizationId = newOrg.id
      } else {
        organizationId = orgData.id
      }

      // Create the project
      const { error: projectError } = await supabase.from('projects').insert({
        title: formData.title,
        description: formData.description,
        funding_goal: parseFloat(formData.fundingGoal),
        organization_id: organizationId,
        wallet_address: walletAddress,
        start_date: new Date().toISOString(),
        status: 'active',
        category: 'Environmental',
      })

      if (projectError) throw projectError

      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'}
              pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
          >
            <div className="w-0 flex-1 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Project created successfully!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Share your new project with the world!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center border-l border-gray-200 p-2">
              <TweetButton
                tweetText={`I just listed my new project "${formData.title}" for funding! Check it out. #crowdfunding #web3 #socialimpact`}
              />
              <button
                onClick={() => router.push('/organizations')}
                className="ml-2 rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000, // Keep the toast open longer
        }
      )
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
      <h1 className='mb-8 text-4xl font-bold text-[#B4F481]'>
        Create New Project
      </h1>
      <div className='rounded-lg bg-gray-800 p-8'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-gray-300'
            >
              Project Title
            </label>
            <input
              type='text'
              id='title'
              value={formData.title}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white'
              placeholder='Enter project title'
              required
            />
          </div>
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-300'
            >
              Description
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className='mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white'
              placeholder='Describe your project'
              required
            />
          </div>
          <div>
            <label
              htmlFor='fundingGoal'
              className='block text-sm font-medium text-gray-300'
            >
              Funding Goal (ETH)
            </label>
            <input
              type='number'
              id='fundingGoal'
              value={formData.fundingGoal}
              onChange={handleInputChange}
              step='0.001'
              className='mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full rounded-md bg-[#B4F481] px-4 py-2 text-black hover:bg-[#9FE070]'
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  )
}

// Original component: CreateProject;
// Auto-generated App Router page wrapper
// Original file: CreateProject.tsx
// Generated: 2025-05-30T01:49:22.850Z

export default function Page() {
  return <CreateProject />
}
