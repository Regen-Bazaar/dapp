'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { Leaf, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import PurchaseModal from '../../components/PurchaseModal'
import TweetButton from '@/components/TweetButton'

interface Project {
  id: string
  title: string
  description: string
  funding_goal: number
  current_funding: number
  start_date: string
  status: string
  impact_value: number
  image_url: string | null
  development_image_url: string | null
  purchase_count: number
  organization: {
    name: string
    logo_url: string
    development_image_url?: string
    type: string
  }
}

const CATEGORIES = [
  'All',
  'CO₂ Emissions Reduction',
  'Air Quality Improvement',
  'Youth Empowerment',
  'Wildlife Conservation',
  'Animal Care',
  'Renewable Energy',
  'Educational Programs',
  'Human Rights Advocacy',
  'Food Programs',
  'Waste Management',
]

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [walletAddress, _setWalletAddress] = useState<string | null>(null)
  {
    /*------------ state to manage purchase status ---------  */
  }
  const [isPurchaseSuccess, setIsPurchaseSuccess] = useState(false)
  useEffect(() => {
    // const checkWallet = async () => {
    //   if (typeof window.ethereum !== 'undefined') {
    //     try {
    //       const accounts = (await window.ethereum.request({
    //         method: 'eth_accounts',
    //       })) as string[]
    //       if (accounts && accounts[0]) {
    //         setWalletAddress(accounts[0])
    //       }
    //     } catch (error) {
    //       console.error('Error checking wallet:', error)
    //     }
    //   }
    // }

    // checkWallet()
    fetchProjects()
  }, [])

  const getProjectImage = (project: Project) => {
    const isDev = process.env.NODE_ENV === 'development'

    // First try project-specific images
    if (isDev && project.development_image_url) {
      return project.development_image_url
    }
    if (project.image_url) {
      return project.image_url
    }

    // Fall back to organization images
    if (isDev && project.organization?.development_image_url) {
      return project.organization.development_image_url
    }
    if (project.organization?.logo_url) {
      return project.organization.logo_url
    }

    // Default to null if no image is available
    return null
  }

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(
          `
          *,
          organization:organizations(name, logo_url, development_image_url, type),
          purchases:purchases(count)
        `
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      const projectsWithCounts = (projectsData || []).map((project) => ({
        ...project,
        purchase_count: project.purchases?.[0]?.count || 0,
      }))

      setProjects(projectsWithCounts)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (project: Project) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }
    setSelectedProject(project)
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseComplete = () => {
    {
      /*------------ updating state of purchase ---------  */
    }
    setIsPurchaseSuccess(true)
    fetchProjects() // Refresh projects to update purchase counts
    setIsPurchaseModalOpen(false)
    setSelectedProject(null)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' ||
      project.organization?.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-[#B4F481]'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <h1 className='mb-12 text-6xl font-bold text-[#B4F481]'>
          BUY IMPACT PRODUCTS
        </h1>

        {/* Search Bar */}
        <div className='relative mb-8'>
          <input
            type='text'
            placeholder='Search impact products...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 pl-12 text-white placeholder-gray-500 focus:border-[#B4F481] focus:outline-none'
          />
          <Search className='absolute top-3.5 left-4 h-5 w-5 text-gray-500' />
        </div>

        {/* Categories */}
        <div className='mb-8 flex flex-wrap gap-4'>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-[#B4F481] text-black'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className='relative overflow-hidden rounded-lg bg-gray-900'
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className='relative aspect-square'>
                {getProjectImage(project) ? (
                  <Image
                    src={getProjectImage(project)!}
                    alt={project.title}
                    layout='fill'
                    objectFit='cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-gray-800'>
                    <Leaf className='h-12 w-12 text-[#B4F481]' />
                  </div>
                )}

                {/* Hover Actions */}
                {hoveredProject === project.id && (
                  <div className='bg-opacity-75 absolute inset-0 flex items-center justify-center bg-black'>
                    <button
                      onClick={() => handlePurchase(project)}
                      className='w-32 rounded bg-[#B4F481] py-2 text-black transition-colors hover:bg-[#9FE070]'
                    >
                      Buy
                    </button>
                  </div>
                )}
              </div>

              <div className='p-4'>
                <h3 className='mb-2 font-medium text-white'>{project.title}</h3>
                {project.organization?.name && (
                  <p className='mb-3 text-sm text-gray-400'>
                    by {project.organization.name}
                  </p>
                )}
                <div className='mb-4 flex justify-between text-sm'>
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

                <div className='text-sm text-gray-400'>
                  <span>{project.purchase_count || 0} purchases</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Modal */}
        {selectedProject && (
          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            project={selectedProject}
            walletAddress={walletAddress}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
        {/*------------ Tweet Button here ---------  */}
        {isPurchaseSuccess && (
          <TweetButton
            text={
              '🎉 I just bought a real-world impact product on RegenBazar! Supporting change while collecting cool NFTs 💚 Check it out: https://regenbazar.com'
            }
          />
        )}
      </div>
    </div>
  )
}

// Original component: Projects;
// Auto-generated App Router page wrapper
// Original file: Projects.tsx
// Generated: 2025-05-30T01:49:22.851Z

export default function Page() {
  return <Projects />
}
