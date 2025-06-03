import React, { useState } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { projectService } from '../lib/projectService'
import { depositVault } from '../lib/contracts/depositVault'
import toast from 'react-hot-toast'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  project: {
    id: string
    title: string
    funding_goal: number
    current_funding: number
  }
  walletAddress: string | null
  onPurchaseComplete: () => void
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  project,
  walletAddress,
  onPurchaseComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'confirmation' | 'processing' | 'complete'>(
    'confirmation'
  )

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setStep('processing')
    setIsProcessing(true)

    try {
      // First make the deposit using the smart contract
      console.log('Attempting deposit with amount:', project.funding_goal)
      const tx = await depositVault.deposit(project.funding_goal.toString())
      console.log('Transaction sent:', tx.hash)

      // Wait for transaction confirmation with user feedback
      const receipt = await toast.promise(tx.wait(), {
        loading: 'Confirming transaction...',
        success: 'Transaction confirmed!',
        error: 'Transaction failed',
      })

      // Then create the purchase record in the database with the transaction hash
      const result = await projectService.purchaseProject(
        project.id,
        walletAddress,
        project.funding_goal,
        receipt.hash
      )

      if (result.success) {
        setStep('complete')
        onPurchaseComplete()
        toast.success('Purchase successful!')
      } else {
        throw new Error(result.error || 'Purchase failed')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user')
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds in wallet')
      } else {
        toast.error(error.message || 'Failed to complete purchase')
      }
      setStep('confirmation')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'confirmation':
        return (
          <>
            <h3 className='mb-4 text-xl font-semibold text-white'>
              Confirm Purchase
            </h3>
            <div className='mb-6 rounded-lg bg-gray-800 p-4'>
              <div className='mb-2 flex justify-between'>
                <span className='text-gray-400'>Amount:</span>
                <span className='text-white'>{project.funding_goal} ETH</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Project:</span>
                <span className='text-white'>{project.title}</span>
              </div>
            </div>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-400 hover:text-white'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className='rounded bg-[#B4F481] px-4 py-2 text-black hover:bg-[#9FE070] disabled:opacity-50'
              >
                {isProcessing ? (
                  <span className='flex items-center'>
                    <span className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black'></span>
                    Processing...
                  </span>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </div>
          </>
        )

      case 'processing':
        return (
          <div className='py-8 text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#B4F481]'></div>
            <p className='text-white'>Processing your purchase...</p>
          </div>
        )

      case 'complete':
        return (
          <div className='py-8 text-center'>
            <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-[#B4F481]' />
            <h3 className='mb-2 text-xl font-semibold text-white'>
              Purchase Complete!
            </h3>
            <p className='mb-6 text-gray-400'>
              Your impact product has been purchased successfully.
            </p>
            <button
              onClick={onClose}
              className='rounded bg-[#B4F481] px-4 py-2 text-black hover:bg-[#9FE070]'
            >
              Close
            </button>
          </div>
        )
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm'>
      <div className='relative mx-4 w-full max-w-md rounded-lg bg-gray-900'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white'
        >
          <X className='h-5 w-5' />
        </button>
        <div className='p-6'>{renderStep()}</div>
      </div>
    </div>
  )
}

export default PurchaseModal
