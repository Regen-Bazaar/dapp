import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, User } from 'lucide-react'
import { disconnectWallet } from '../lib/web3'
import toast from 'react-hot-toast'
import WalletModal from './WalletModal'
import { useWallet } from '../context/WalletContext'

const Navbar = () => {
  const { walletAddress, connect, disconnect, isConnecting } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasPurchasedProducts, setHasPurchasedProducts] = useState(true) // Set to true to always show Stake
  const [rebazBalance, setRebazBalance] = useState(150)
  const [rwiRank, setRwiRank] = useState(70)
  const navigate = useNavigate()

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet()
      disconnect()
      toast.success('Wallet disconnected successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect wallet')
    }
  }

  const handleConnectWallet = async (
    walletType: string,
    manualAddress?: string
  ) => {
    try {
      await connect(walletType, manualAddress)
      setIsWalletModalOpen(false)
    } catch (error: any) {
      if (error.message.includes('Please connect your wallet')) {
        return
      }
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  return (
    <nav className='sticky top-0 z-50 border-b border-gray-800 bg-black'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-14 items-center justify-between'>
          {/* Left Section - User Profile */}
          <div className='flex items-center'>
            {walletAddress ? (
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <User className='h-5 w-5 text-gray-400' />
                  <span className='font-medium text-white'>Paul Burg</span>
                </div>
                <div className='flex items-center space-x-4 text-sm'>
                  <span className='text-gray-400'>
                    RWI RANK: <span className='text-[#B4F481]'>{rwiRank}</span>
                  </span>
                  <span className='text-gray-400'>
                    voREBAZ:{' '}
                    <span className='text-[#B4F481]'>{rebazBalance}</span>
                  </span>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className='flex items-center space-x-1 text-gray-400 transition-colors hover:text-white'
                >
                  <LogOut className='h-4 w-4' />
                  <span className='text-sm'>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <User className='h-5 w-5 text-gray-400' />
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  disabled={isConnecting}
                  className='rounded bg-[#B4F481] px-4 py-1.5 text-sm text-black transition-colors hover:bg-[#9FE070] disabled:opacity-50'
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            )}
          </div>

          {/* Right Section - Navigation */}
          <div className='flex items-center space-x-2'>
            <div className='hidden items-center space-x-2 md:flex'>
              <Link
                to='/profile'
                className='py-1.0 rounded bg-[#1D211A] px-4 text-sm text-lime-400 transition-colors hover:bg-[#2A462C] hover:text-gray-200'
              >
                Dashboard
              </Link>
              <Link
                to='/projects'
                className='py-1.0 rounded bg-[#1D211A] px-4 text-sm text-lime-400 transition-colors hover:bg-[#2A462C] hover:text-gray-200'
              >
                Purchase
              </Link>
              <Link
                to='/create-profile'
                className='py-1.0 rounded bg-[#1D211A] px-4 text-sm text-lime-400 transition-colors hover:bg-[#2A462C] hover:text-gray-200'
              >
                Tokenize
              </Link>
              {hasPurchasedProducts && (
                <Link
                  to='/stake'
                  className='py-1.0 rounded bg-[#1D211A] px-4 text-sm text-lime-400 transition-colors hover:bg-[#2A462C] hover:text-gray-200'
                >
                  Stake
                </Link>
              )}
              {rebazBalance > 100 && (
                <Link
                  to='/vote'
                  className='py-1.0 rounded bg-[#1D211A] px-4 text-sm text-gray-400 transition-colors hover:bg-[#2A462C] hover:text-gray-200'
                >
                  Vote
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              {isMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='space-y-1 py-2 md:hidden'>
            <Link
              to='/profile'
              className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              Dashboard
            </Link>
            <Link
              to='/projects'
              className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              Purchase
            </Link>
            <Link
              to='/create-profile'
              className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              Tokenize
            </Link>
            {hasPurchasedProducts && (
              <Link
                to='/stake'
                className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
              >
                Stake
              </Link>
            )}
            {rebazBalance > 100 && (
              <Link
                to='/vote'
                className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
              >
                Vote
              </Link>
            )}
            <div className='my-2 border-t border-gray-800'></div>
            <Link
              to='/about'
              className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              About Us
            </Link>
            <Link
              to='/leaderboard'
              className='block rounded px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              Leaderboard
            </Link>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleConnectWallet}
      />
    </nav>
  )
}

export default Navbar
