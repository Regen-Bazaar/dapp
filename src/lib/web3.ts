import { ethers } from 'ethers'
import { FEATURES } from './config'

// Base Testnet configuration
export const BASE_TESTNET = {
  chainId: '0x14a34', // 84532 in decimal
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
}

let provider: ethers.BrowserProvider | null = null
let connectionAttempts = 0
const MAX_ATTEMPTS = 3

// Enhanced ethereum provider detection with safe access
const getEthereumProvider = () => {
  try {
    if (typeof window === 'undefined') return null

    // Safely check for ethereum property using Object.getOwnPropertyDescriptor
    const ethereumDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'ethereum'
    )
    if (!ethereumDescriptor || !ethereumDescriptor.value) return null

    const ethereum = ethereumDescriptor.value

    // Return the provider directly if it's a single provider
    if (!ethereum.providers) {
      return ethereum
    }

    // If we have multiple providers, prioritize them
    const providers = ethereum.providers
    const metamask = providers.find(
      (p: any) => p.isMetaMask && !p.isBraveWallet
    )
    const coinbase = providers.find((p: any) => p.isCoinbaseWallet)
    const trust = providers.find((p: any) => p.isTrust || p.isTrustWallet)
    const brave = providers.find((p: any) => p.isBraveWallet)

    // Return the first available provider in order of preference
    return metamask || coinbase || trust || brave || providers[0]
  } catch (error) {
    console.warn('Error detecting Ethereum provider:', error)
    return null
  }
}

// Define wallet providers with enhanced detection
export const WALLET_PROVIDERS = {
  METAMASK: {
    name: 'MetaMask',
    icon: '🦊',
    check: () => {
      const ethereum = getEthereumProvider()
      return (ethereum?.isMetaMask && !ethereum?.isBraveWallet) || false
    },
    getProvider: () => {
      const ethereum = getEthereumProvider()
      if (!ethereum?.isMetaMask || ethereum?.isBraveWallet) {
        throw new Error('Please install MetaMask to continue')
      }
      return ethereum
    },
  },
  COINBASE: {
    name: 'Coinbase Wallet',
    icon: '📱',
    check: () => {
      const ethereum = getEthereumProvider()
      return ethereum?.isCoinbaseWallet || false
    },
    getProvider: () => {
      const ethereum = getEthereumProvider()
      if (!ethereum?.isCoinbaseWallet) {
        throw new Error('Please install Coinbase Wallet to continue')
      }
      return ethereum
    },
  },
  TRUST: {
    name: 'Trust Wallet',
    icon: '🔐',
    check: () => {
      const ethereum = getEthereumProvider()
      return ethereum?.isTrust || ethereum?.isTrustWallet || false
    },
    getProvider: () => {
      const ethereum = getEthereumProvider()
      if (!ethereum?.isTrust && !ethereum?.isTrustWallet) {
        throw new Error('Please install Trust Wallet to continue')
      }
      return ethereum
    },
  },
  BRAVE: {
    name: 'Brave Wallet',
    icon: '🦁',
    check: () => {
      const ethereum = getEthereumProvider()
      return ethereum?.isBraveWallet || false
    },
    getProvider: () => {
      const ethereum = getEthereumProvider()
      if (!ethereum?.isBraveWallet) {
        throw new Error('Brave Wallet not available')
      }
      return ethereum
    },
  },
}

// Get available wallet providers
export function getAvailableWallets() {
  return Object.entries(WALLET_PROVIDERS).map(([key, provider]) => ({
    id: key.toLowerCase(),
    name: provider.name,
    icon: provider.icon,
  }))
}

async function switchToBaseTestnet(provider: any): Promise<boolean> {
  try {
    // First try to switch to Base Sepolia
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_TESTNET.chainId }],
    })
    return true
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BASE_TESTNET.chainId,
              chainName: BASE_TESTNET.chainName,
              nativeCurrency: BASE_TESTNET.nativeCurrency,
              rpcUrls: BASE_TESTNET.rpcUrls,
              blockExplorerUrls: BASE_TESTNET.blockExplorerUrls,
            },
          ],
        })

        // After adding, try to switch again
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_TESTNET.chainId }],
        })

        return true
      } catch (addError: any) {
        if (addError.code === 4001) {
          throw new Error('Please add Base Sepolia network to continue')
        }
        throw new Error('Failed to add Base Sepolia network. Please try again.')
      }
    }
    if (switchError.code === 4001) {
      throw new Error('Please switch to Base Sepolia network to continue')
    }
    throw new Error(
      'Failed to switch to Base Sepolia network. Please try again.'
    )
  }
}

export async function connectWallet(
  walletType: string = 'metamask',
  manualAddress?: string
): Promise<string | null> {
  // Reset provider and connection attempts
  provider = null
  connectionAttempts = 0

  try {
    if (connectionAttempts >= MAX_ATTEMPTS) {
      throw new Error(
        'Maximum connection attempts reached. Please try again later.'
      )
    }

    connectionAttempts++

    // Get the specific wallet provider
    const walletKey = walletType.toUpperCase()
    const walletProvider =
      WALLET_PROVIDERS[walletKey as keyof typeof WALLET_PROVIDERS]

    if (!walletProvider) {
      throw new Error('Unsupported wallet type')
    }

    // Get the provider
    const ethereumProvider = await walletProvider.getProvider()
    if (!ethereumProvider) {
      throw new Error(
        `${walletProvider.name} not found. Please install it first.`
      )
    }

    // Create ethers provider
    provider = new ethers.BrowserProvider(ethereumProvider, {
      name: BASE_TESTNET.chainName,
      chainId: parseInt(BASE_TESTNET.chainId),
    })

    try {
      // Switch to Base Testnet first
      await switchToBaseTestnet(ethereumProvider)

      // Then request accounts with a timeout
      const accounts = (await Promise.race([
        ethereumProvider.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        ),
      ])) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet')
      }

      // Reset connection attempts on success
      connectionAttempts = 0
      return accounts[0]
    } catch (error: any) {
      // Handle user rejection specifically
      if (error.code === 4001) {
        connectionAttempts = 0 // Reset attempts for user rejections
        throw new Error('Connection rejected by user')
      }
      throw error
    }
  } catch (error: any) {
    // Reset connection attempts for specific errors
    if (error.code === 4001 || error.message.includes('Please install')) {
      connectionAttempts = 0
    }
    console.error('Wallet connection error:', error)
    throw error
  }
}

export function subscribeToAccountChanges(
  callback: (account: string | null) => void
): void {
  const ethereum = getEthereumProvider()
  if (ethereum) {
    ethereum.on('accountsChanged', (accounts: string[]) => {
      callback(accounts[0] || null)
    })

    ethereum.on('chainChanged', async () => {
      provider = null
      connectionAttempts = 0
      window.location.reload()
    })

    ethereum.on('disconnect', () => {
      provider = null
      connectionAttempts = 0
      callback(null)
    })
  }
}

export function disconnectWallet(): Promise<void> {
  return new Promise((resolve) => {
    try {
      provider = null
      connectionAttempts = 0

      // Clear any stored wallet state
      const ethereum = getEthereumProvider()
      if (ethereum) {
        ethereum.removeAllListeners?.()
      }

      // Clear any stored provider state
      localStorage.removeItem('walletconnect')
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE')

      resolve()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      resolve() // Resolve anyway to ensure the UI updates
    }
  })
}

export function getProvider(): ethers.BrowserProvider | null {
  return provider
}

export function resetConnectionAttempts(): void {
  connectionAttempts = 0
}
