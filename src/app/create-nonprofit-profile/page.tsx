'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useWallet } from '../../context/WalletContext'
import { depositVault } from '../../lib/contracts/depositVault'
import { generateProfileImage } from '../../lib/generateImage'
import { FEATURES } from '../../lib/config'
import TweetButton from '@/components/TweetButton'
interface ImpactAction {
  title: string
  achievedImpact: string
  period: string
  location: string
}

const CreateNonProfitProfile = () => {
  const router = useRouter()
  const { walletAddress } = useWallet()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('')
  const [devImageUrl, setDevImageUrl] = useState<string>('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const [formData, setFormData] = useState({
    organizationType: 'Foundation',
    entityName: '',
    walletAddress: '',
    transactionHash: undefined as string | undefined,
  })

  const [impactActions, setImpactActions] = useState<ImpactAction[]>([
    {
      title: '',
      achievedImpact: '',
      period: '',
      location: '',
    },
  ])

  const [proofOfImpact, setProofOfImpact] = useState('')
  const [technicalSkillLevel, setTechnicalSkillLevel] = useState('low')
  const [price, setPrice] = useState<string>('')
  const [impactValue, setImpactValue] = useState<number>(0)

  useEffect(() => {
    if (walletAddress) {
      setFormData((prev) => ({ ...prev, walletAddress }))
      console.log('Form updated with wallet address:', walletAddress)
    }
  }, [walletAddress])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImpactActionChange = (
    index: number,
    field: keyof ImpactAction,
    value: string
  ) => {
    const updatedActions = [...impactActions]
    updatedActions[index] = { ...updatedActions[index], [field]: value }
    setImpactActions(updatedActions)
  }

  const addImpactAction = () => {
    setImpactActions([
      ...impactActions,
      {
        title: '',
        achievedImpact: '',
        period: '',
        location: '',
      },
    ])
  }

  const generateRandomValues = () => {
    const randomPrice = Number(
      (Math.random() * (0.0009 - 0.0001) + 0.0001).toFixed(4)
    )
    const randomImpact = Math.floor(Math.random() * 10) + 1

    setPrice(randomPrice.toString())
    setImpactValue(randomImpact)
  }

  const generateImage = async () => {
    if (!FEATURES.IMAGE_GENERATION) {
      const defaultImage =
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80'
      setGeneratedImageUrl(defaultImage)
      if (isDevelopment) {
        setDevImageUrl(defaultImage)
      }
      return
    }

    setIsGeneratingImage(true)
    try {
      const description = `${formData.entityName} - ${impactActions
        .map(
          (action) =>
            `${action.achievedImpact} through ${action.title} in ${action.location}`
        )
        .join(', ')}`

      const imageUrl = await generateProfileImage(description)
      setGeneratedImageUrl(imageUrl)
      if (isDevelopment) {
        setDevImageUrl(imageUrl)
      }
      toast.success('Image generated successfully!')
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleTokenize = async () => {
    setIsProcessing(true)
    try {
      await generateImage()
      generateRandomValues()
      setCurrentStep(2)
    } catch (error) {
      console.error('Tokenize error:', error)
      toast.error('Failed to tokenize impact')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeploy = async () => {
    if (!generatedImageUrl) {
      toast.error('Please generate an image first')
      return
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    try {
      console.log('Attempting deposit with amount:', price)
      const tx = await depositVault.deposit(price)
      console.log('Transaction sent:', tx.hash)

      const receipt = await toast.promise(tx.wait(), {
        loading: 'Confirming transaction...',
        success: 'Deposit confirmed!',
        error: 'Transaction failed',
      })

      if (receipt) {
        setFormData((prev) => ({
          ...prev,
          transactionHash: receipt.hash,
        }))
      }

      setCurrentStep(3)
    } catch (error: unknown) {
      console.error('Deploy error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to deploy'
      if (errorMessage.includes('ACTION_REJECTED')) {
        toast.error('Transaction rejected by user')
      } else if (errorMessage.includes('insufficient funds')) {
        toast.error('Insufficient funds in wallet')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('wallet_address', formData.walletAddress)
        .single()

      let orgId: string

      if (existingOrg) {
        orgId = existingOrg.id
        if (isDevelopment) {
          await supabase
            .from('organizations')
            .update({ development_image_url: devImageUrl })
            .eq('id', orgId)
        }
      } else {
        const baseUsername = formData.entityName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 10)
        const uniqueSuffix = formData.walletAddress.slice(2, 8).toLowerCase()
        const username = `${baseUsername}_${uniqueSuffix}`

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.entityName,
            type: formData.organizationType,
            wallet_address: formData.walletAddress,
            logo_url: generatedImageUrl,
            development_image_url: isDevelopment ? devImageUrl : null,
            verified: false,
            username: username,
          })
          .select()
          .single()

        if (orgError) throw orgError
        orgId = orgData.id
      }

      for (const action of impactActions) {
        const { error: projectError } = await supabase.from('projects').insert({
          title: action.title,
          description: `${action.achievedImpact} in ${action.location} during ${action.period}`,
          category: formData.organizationType,
          funding_goal: parseFloat(price),
          start_date: new Date().toISOString(),
          status: 'active',
          current_funding: 0,
          organization_id: orgId,
          wallet_address: formData.walletAddress,
          transaction_hash: formData.transactionHash || '',
        })

        if (projectError) {
          console.error('Project creation error:', projectError)
          throw new Error('Failed to create project')
        }
      }

      toast.success('Profile and projects created successfully!')
      router.push(`/organization-profile?id=${orgId}`)
    } catch (error: unknown) {
      console.error('Submission error:', error)
      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleProofOfImpactChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProofOfImpact(e.target.value)
  }

  const handleTechnicalSkillLevelChange = (level: string) => {
    setTechnicalSkillLevel(level)
  }

  // Step 2 handlers
  const handlePriceChangeStep2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value)
  }

  const handleImpactValueChangeStep2 = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImpactValue(Number(e.target.value))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className='lg:col-span-2'>
              {/* Impact Product Data Form */}

              <div className='rounded-lg border border-gray-800 bg-black/50 p-6'>
                <h2 className='mb-6 text-xl font-semibold'>
                  IMPACT PRODUCT DATA
                </h2>

                <div className='mb-6'>
                  <label
                    htmlFor='entityName'
                    className='mb-2 block font-medium text-white'
                  >
                    Entity Name
                  </label>
                  <input
                    id='entityName'
                    type='text'
                    name='entityName'
                    value={formData.entityName}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded border-gray-700 bg-gray-900 text-white'
                    placeholder='Name of your Foundation, DAO, etc'
                  />
                </div>

                <div className='mb-6'>
                  <label
                    htmlFor='organizationType'
                    className='mb-2 block font-medium text-white'
                  >
                    Organization Type
                  </label>
                  <select
                    id='organizationType'
                    name='organizationType'
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    className='mt-1 block w-full rounded border-gray-700 bg-gray-900 text-white'
                  >
                    <option>Foundation</option>
                    <option>Company</option>
                    <option>DAO</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                {impactActions.map((action, index) => (
                  <div
                    key={index}
                    className='mb-4 rounded-lg border border-gray-700 p-4'
                  >
                    <h3 className='mb-2 font-medium'>
                      Impact Action #{index + 1}
                    </h3>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <div>
                        <label
                          htmlFor={`title-${index}`}
                          className='text-sm text-gray-400'
                        >
                          Title
                        </label>
                        <input
                          id={`title-${index}`}
                          type='text'
                          value={action.title}
                          onChange={(e) =>
                            handleImpactActionChange(
                              index,
                              'title',
                              e.target.value
                            )
                          }
                          className='mt-1 block w-full rounded border-gray-600 bg-gray-800 text-white'
                          placeholder='e.g., Planted Trees'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`achievedImpact-${index}`}
                          className='text-sm text-gray-400'
                        >
                          Achieved Impact
                        </label>
                        <input
                          id={`achievedImpact-${index}`}
                          type='text'
                          value={action.achievedImpact}
                          onChange={(e) =>
                            handleImpactActionChange(
                              index,
                              'achievedImpact',
                              e.target.value
                            )
                          }
                          className='mt-1 block w-full rounded border-gray-600 bg-gray-800 text-white'
                          placeholder='e.g., 10,000'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`period-${index}`}
                          className='text-sm text-gray-400'
                        >
                          Period
                        </label>
                        <input
                          id={`period-${index}`}
                          type='text'
                          value={action.period}
                          onChange={(e) =>
                            handleImpactActionChange(
                              index,
                              'period',
                              e.target.value
                            )
                          }
                          className='mt-1 block w-full rounded border-gray-600 bg-gray-800 text-white'
                          placeholder='e.g., Q3 2023'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`location-${index}`}
                          className='text-sm text-gray-400'
                        >
                          Location
                        </label>
                        <input
                          id={`location-${index}`}
                          type='text'
                          value={action.location}
                          onChange={(e) =>
                            handleImpactActionChange(
                              index,
                              'location',
                              e.target.value
                            )
                          }
                          className='mt-1 block w-full rounded border-gray-600 bg-gray-800 text-white'
                          placeholder='e.g., Amazon Rainforest'
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addImpactAction}
                  className='text-sm text-[#B4F481] hover:underline'
                >
                  + Add another impact action
                </button>

                <div className='mt-6'>
                  <label
                    htmlFor='proofOfImpact'
                    className='mb-2 block font-medium text-white'
                  >
                    Proof of Impact
                  </label>
                  <input
                    id='proofOfImpact'
                    type='text'
                    value={proofOfImpact}
                    onChange={handleProofOfImpactChange}
                    className='mt-1 block w-full rounded border-gray-700 bg-gray-900 text-white'
                    placeholder='URL to proof'
                  />
                </div>

                <div className='mt-6'>
                  <div
                    id='tech-skill-label'
                    className='mb-2 block font-medium text-white'
                  >
                    What is your team&apos;s technical skill level?
                  </div>
                  <div
                    role='group'
                    aria-labelledby='tech-skill-label'
                    className='flex space-x-2 rounded-lg bg-gray-900 p-1'
                  >
                    {['Low', 'Medium', 'High'].map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          handleTechnicalSkillLevelChange(level.toLowerCase())
                        }
                        className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          technicalSkillLevel === level.toLowerCase()
                            ? 'bg-[#B4F481] text-black'
                            : 'bg-transparent text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Preview */}
            <div className='rounded-lg border border-gray-800 bg-black/50 p-6'>
              <h2 className='mb-6 text-xl font-semibold'>COLLECTION PREVIEW</h2>

              <div className='relative aspect-square w-full overflow-hidden rounded-lg bg-gray-900'>
                {generatedImageUrl ? (
                  <Image
                    src={generatedImageUrl}
                    alt='Generated profile image'
                    layout='fill'
                    objectFit='cover'
                    unoptimized={isDevelopment}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
                  </div>
                )}
              </div>

              <div className='mt-4'>
                <p className='text-lg font-bold'>
                  {formData.entityName || 'Your Org Name'}
                </p>
                <p className='text-sm text-gray-400'>
                  {impactActions[0]?.title || 'Your Impact Title'}
                </p>
              </div>

              <button
                onClick={generateImage}
                disabled={isGeneratingImage || !formData.entityName}
                className='mt-6 w-full rounded bg-[#B4F481] px-4 py-2 text-black transition-colors hover:bg-[#9FE070] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isGeneratingImage ? (
                  <Loader2 className='mx-auto h-5 w-5 animate-spin' />
                ) : (
                  'Generate Image'
                )}
              </button>

              <button
                onClick={handleTokenize}
                disabled={isProcessing}
                className='mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
              >
                Tokenize
              </button>
            </div>
          </>
        )
      case 2:
        return (
          <div className='rounded-lg border border-gray-800 bg-black/50 p-6'>
            <h2 className='mb-6 text-xl font-semibold'>Set Your Price</h2>

            <div className='mb-4'>
              <label
                htmlFor='price'
                className='mb-2 block font-medium text-white'
              >
                Price (ETH)
              </label>
              <input
                id='price'
                type='text'
                value={price}
                onChange={handlePriceChangeStep2}
                className='block w-full rounded border-gray-700 bg-gray-900 text-white'
              />
            </div>

            <div className='mb-6'>
              <label
                htmlFor='impactValue'
                className='mb-2 block font-medium text-white'
              >
                Impact Value
              </label>
              <input
                id='impactValue'
                type='number'
                className='block w-full rounded border-gray-700 bg-gray-900 text-white'
                value={impactValue}
                onChange={handleImpactValueChangeStep2}
              />
            </div>

            <button
              onClick={handleDeploy}
              disabled={!generatedImageUrl || isProcessing || currentStep !== 2}
              className='mt-8 w-full rounded-md bg-[#B4F481] py-2 font-medium text-black hover:bg-[#9FE070] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isProcessing ? (
                <span className='flex items-center justify-center'>
                  <Loader2 className='mr-3 -ml-1 h-5 w-5 animate-spin' />
                  Processing...
                </span>
              ) : (
                'CONFIRM AND DEPLOY'
              )}
            </button>
          </div>
        )
      case 3:
        return (
          <div className='rounded-lg border border-gray-800 bg-black/50 p-6'>
            <h2 className='mb-6 text-xl font-semibold'>LIST FOR SALE</h2>
            <p className='mb-6 text-gray-400'>
              Open for public purchase on Regen Bazaar
            </p>

            <button
              onClick={handleSubmit}
              disabled={loading || currentStep !== 3}
              className='mb-8 w-full rounded-md bg-[#B4F481] py-2 font-medium text-black hover:bg-[#9FE070] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <Loader2 className='mr-3 -ml-1 h-5 w-5 animate-spin' />
                  Processing...
                </span>
              ) : (
                'LIST'
              )}
            </button>

            <div className='mt-12'>
              <h3 className='mb-4 text-lg font-medium'>
                Promote to your community and potential buyers
              </h3>
              {/*------------ Tweet Button here ---------  */}
              <TweetButton
                text={
                  '🚀 Just listed my real-world impact product on RegenBazar! 🌱💧 Explore it here: https://regenbazar.com'
                }
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='min-h-screen bg-black px-4 py-12 text-white sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-5xl'>
        <h1 className='mb-12 text-6xl font-bold text-[#B4F481]'>
          TOKENIZE YOUR REAL-WORLD IMPACT
        </h1>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

// Original component: CreateNonProfitProfile;
// Auto-generated App Router page wrapper
// Original file: CreateNonProfitProfile.tsx
// Generated: 2025-05-30T01:49:22.849Z

export default function Page() {
  return <CreateNonProfitProfile />
}
