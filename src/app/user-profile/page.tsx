'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getProvider } from '../../lib/web3'
import { projectService } from '../../lib/projectService'
import { useWallet } from '../../context/WalletContext'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  description: string
  funding_goal: number
  current_funding: number
  impact_value: number
  organization: {
    name: string
    logo_url: string
  }
}

const UserProfile = () => {
  const { walletAddress } = useWallet()
  const [loading, setLoading] = useState(true)
  const [createdProjects, setCreatedProjects] = useState<Project[]>([])
  const [purchasedProjects, setPurchasedProjects] = useState<Project[]>([])
  const [stakedProjects, setStakedProjects] = useState<Project[]>([])

  useEffect(() => {
    if (walletAddress) {
      fetchUserData(walletAddress)
    } else {
      setLoading(false)
    }
  }, [walletAddress])

  const fetchUserData = async (address: string) => {
    try {
      // Fetch all purchases with staking status
      const purchases =
        await projectService.getUserPurchasesWithStakingStatus(address)
      setPurchasedProjects(purchases.map((p) => p.project).filter(Boolean))

      // Fetch created projects
      const { data: created, error: createdError } = await supabase
        .from('projects')
        .select(
          `
          *,
          organization:organizations(name, logo_url)
        `
        )
        .eq('wallet_address', address)

      if (createdError) throw createdError
      setCreatedProjects(created || [])

      // Fetch staked projects
      const stakes = await projectService.getStakedProjects(address)
      setStakedProjects(
        stakes.map((stake) => stake.purchase.project).filter(Boolean)
      )
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleStake = async (projectId: string) => {
    try {
      const result = await projectService.stakeProject(projectId)
      if (result.success) {
        toast.success('Project staked successfully')
        if (walletAddress) {
          fetchUserData(walletAddress)
        }
      } else {
        throw new Error(result.error || 'Failed to stake project')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const renderProjectGrid = (
    projects: Project[],
    type: 'created' | 'purchased' | 'staked'
  ) => (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      {Array.isArray(projects) &&
        projects.map((project) => {
          // Create a unique key combining type, project id, and a random string
          const uniqueKey = `${type}-${project.id}-${Math.random().toString(36).substr(2, 9)}`

          return (
            <div
              key={uniqueKey}
              className='overflow-hidden rounded-lg bg-gray-900'
            >
              <div className='relative aspect-square'>
                {project.organization?.logo_url ? (
                  <img
                    src={project.organization.logo_url}
                    alt={project.title}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='h-full w-full bg-gray-800' />
                )}
                <div className='bg-opacity-75 absolute inset-0 flex items-center justify-center gap-4 bg-black opacity-0 transition-opacity hover:opacity-100'>
                  {type === 'purchased' && (
                    <>
                      <button
                        onClick={() => handleStake(project.id)}
                        className='rounded bg-[#B4F481] px-4 py-2 text-black transition-colors hover:bg-[#9FE070]'
                      >
                        Stake
                      </button>
                      <button className='rounded bg-[#B4F481] px-4 py-2 text-black transition-colors hover:bg-[#9FE070]'>
                        Resell
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className='p-4'>
                <h3 className='mb-2 font-medium text-white'>{project.title}</h3>
                <div className='flex justify-between text-sm'>
                  <div>
                    <p className='text-gray-500'>price</p>
                    <p className='text-[#B4F481]'>Eth {project.funding_goal}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-gray-500'>impact value</p>
                    <p className='text-[#B4F481]'>
                      {project.impact_value || 0.1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      {type === 'created' && (
        <div className='flex aspect-square items-center justify-center rounded-lg bg-gray-900/50'>
          <Plus className='h-12 w-12 text-[#B4F481] opacity-50' />
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <Loader2 className='h-12 w-12 animate-spin text-[#B4F481]' />
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className='min-h-screen bg-black'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <p className='text-gray-400'>
              Please connect your wallet to view your profile
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <h1 className='mb-12 text-4xl font-bold text-[#B4F481]'>MY PROFILE</h1>

        {/* Only show Created Projects section if there are projects */}
        {createdProjects.length > 0 && (
          <div className='mb-12'>
            <h2 className='mb-6 text-2xl font-bold text-white'>
              Created Projects
            </h2>
            {renderProjectGrid(createdProjects, 'created')}
          </div>
        )}

        <div className='mb-12'>
          <h2 className='mb-6 text-2xl font-bold text-white'>
            Purchased Projects
          </h2>
          {purchasedProjects.length > 0 ? (
            renderProjectGrid(purchasedProjects, 'purchased')
          ) : (
            <div className='rounded-lg bg-gray-900/50 py-12 text-center'>
              <p className='text-gray-500'>No purchased projects yet</p>
            </div>
          )}
        </div>

        <div className='mb-12'>
          <h2 className='mb-6 text-2xl font-bold text-white'>
            Staked Projects
          </h2>
          {stakedProjects.length > 0 ? (
            renderProjectGrid(stakedProjects, 'staked')
          ) : (
            <div className='rounded-lg bg-gray-900/50 py-12 text-center'>
              <p className='text-gray-500'>No staked projects yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Original component: UserProfile;
// Auto-generated App Router page wrapper
// Original file: UserProfile.tsx
// Generated: 2025-05-30T01:49:22.852Z

export default function Page() {
  return <UserProfile />
}
