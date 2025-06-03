'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Loader2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  funding_goal: number
  current_funding: number
  organization: {
    name: string
    logo_url: string
  }
}

const ProjectDetails = () => {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(
            `
            *,
            organization:organizations(name, logo_url)
          `
          )
          .eq('id', id)
          .single()

        if (error) throw error
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <Loader2 className='h-12 w-12 animate-spin text-[#B4F481]' />
      </div>
    )
  }

  if (!project) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='text-center text-gray-400'>Project not found</div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
      <div className='overflow-hidden rounded-lg bg-gray-800'>
        <div className='p-8'>
          <h1 className='mb-4 text-4xl font-bold text-[#B4F481]'>
            {project.title}
          </h1>
          <div className='mb-6 flex items-center'>
            <img
              src={project.organization.logo_url}
              alt={project.organization.name}
              className='mr-4 h-12 w-12 rounded-full'
            />
            <div>
              <p className='text-white'>{project.organization.name}</p>
              <p className='text-gray-400'>Project Creator</p>
            </div>
          </div>
          <p className='mb-8 text-gray-300'>{project.description}</p>
          <div className='grid grid-cols-2 gap-8'>
            <div>
              <p className='text-gray-400'>Funding Goal</p>
              <p className='text-2xl font-bold text-[#B4F481]'>
                {project.funding_goal} ETH
              </p>
            </div>
            <div>
              <p className='text-gray-400'>Current Funding</p>
              <p className='text-2xl font-bold text-[#B4F481]'>
                {project.current_funding} ETH
              </p>
            </div>
          </div>
          <button className='mt-8 w-full rounded-md bg-[#B4F481] px-4 py-3 text-black hover:bg-[#9FE070]'>
            Buy Impact Token
          </button>
        </div>
      </div>
    </div>
  )
}

// Original component: ProjectDetails;
// Auto-generated App Router page wrapper
// Original file: ProjectDetails.tsx
// Generated: 2025-05-30T01:49:22.851Z

export default function Page() {
  return <ProjectDetails />
}
