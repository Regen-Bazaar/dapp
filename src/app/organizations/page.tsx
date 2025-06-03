'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string
  funding_goal: number
  current_funding: number
  impact_value: number
  wallet_address: string
  organization: {
    name: string
    logo_url: string
  }
}

interface ProjectsByWallet {
  [key: string]: Project[]
}

const Organizations = () => {
  const [loading, setLoading] = useState(true)
  const [projectsByWallet, setProjectsByWallet] = useState<ProjectsByWallet>({})
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0])
            await fetchProjects()
          }
        } catch (error) {
          console.error('Error checking wallet:', error)
        }
      }
    }

    checkWallet()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          organization:organizations(name, logo_url)
        `
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group projects by wallet address
      const grouped = (projects || []).reduce(
        (acc: ProjectsByWallet, project) => {
          if (!acc[project.wallet_address]) {
            acc[project.wallet_address] = []
          }
          acc[project.wallet_address].push(project)
          return acc
        },
        {}
      )

      setProjectsByWallet(grouped)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <Loader2 className='h-12 w-12 animate-spin text-[#B4F481]' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-4xl font-bold text-[#B4F481]'>Organizations</h1>
          {walletAddress && (
            <Link
              href='/create-project'
              className='rounded-md bg-[#B4F481] px-6 py-3 text-black transition-colors hover:bg-[#9FE070]'
            >
              Create New Project
            </Link>
          )}
        </div>

        {Object.entries(projectsByWallet).map(([address, projects]) => (
          <div key={address} className='mb-12'>
            <h2 className='mb-6 text-xl font-semibold text-white'>
              Organization ({address.slice(0, 6)}...{address.slice(-4)})
            </h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className='overflow-hidden rounded-lg bg-gray-900'
                >
                  <div className='relative aspect-square bg-gray-800'>
                    {project.organization?.logo_url && (
                      <img
                        src={project.organization.logo_url}
                        alt={project.title}
                        className='h-full w-full object-cover'
                      />
                    )}
                  </div>
                  <div className='p-6'>
                    <h3 className='mb-2 text-xl font-semibold text-white'>
                      {project.title}
                    </h3>
                    <p className='mb-4 line-clamp-2 text-gray-400'>
                      {project.description}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-500'>Funding Goal</p>
                        <p className='text-[#B4F481]'>
                          {project.funding_goal} ETH
                        </p>
                      </div>
                      <Link
                        href={`/project/${project.id}`}
                        className='flex items-center text-[#B4F481] hover:text-[#9FE070]'
                      >
                        View Details
                        <ArrowUpRight className='ml-1 h-4 w-4' />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(projectsByWallet).length === 0 && (
          <div className='rounded-lg bg-gray-900/50 py-12 text-center'>
            <p className='text-gray-400'>No organizations found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Original component: Organizations;
// Auto-generated App Router page wrapper
// Original file: Organizations.tsx
// Generated: 2025-05-30T01:49:22.851Z

export default function Page() {
  return <Organizations />
}
