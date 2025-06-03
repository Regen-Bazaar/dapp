'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { connectWallet, subscribeToAccountChanges } from '../lib/web3'
import toast from 'react-hot-toast'

interface WalletContextType {
  walletAddress: string | null
  connect: (walletType?: string, manualAddress?: string) => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Subscribe to account changes
    const unsubscribe = subscribeToAccountChanges((newAccount) => {
      console.log('Wallet address changed:', newAccount)
      setWalletAddress(newAccount)

      if (!newAccount) {
        toast.error('Wallet disconnected')
      }
    })

    // Check for existing connection on mount
    const checkConnection = async () => {
      try {
        const address = await connectWallet()
        if (address) {
          console.log('Wallet connected:', address)
          setWalletAddress(address)
        }
      } catch (error) {
        // Only log actual errors, not the initial connection check
        if (
          !(
            error instanceof Error &&
            error.message.includes('Please connect your wallet')
          )
        ) {
          console.error('Wallet connection error:', error)
        }
      }
    }

    checkConnection()

    // Cleanup subscription
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  const connect = async (walletType?: string, manualAddress?: string) => {
    if (isConnecting) return

    setIsConnecting(true)
    try {
      const address = await connectWallet(walletType, manualAddress)
      if (address) {
        console.log('Wallet connected:', address)
        setWalletAddress(address)
        toast.success('Wallet connected successfully!')
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
    console.log('Wallet disconnected')
  }

  return (
    <WalletContext.Provider
      value={{ walletAddress, connect, disconnect, isConnecting }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
