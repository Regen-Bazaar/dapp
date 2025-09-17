import { supabase } from './supabase'

export interface UserProfile {
  wallet_address: string
  username?: string
  avatar_url?: string
  organization?: {
    name: string
    logo_url?: string
    development_image_url?: string
  }
}

export const userService = {
  // Get user profile by wallet address
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      // First try to get organization data
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, logo_url, development_image_url')
        .eq('wallet_address', walletAddress)
        .single()

      if (orgData) {
        return {
          wallet_address: walletAddress,
          organization: {
            name: orgData.name,
            logo_url: orgData.logo_url,
            development_image_url: orgData.development_image_url,
          },
        }
      }

      // If no organization, return basic profile
      return {
        wallet_address: walletAddress,
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Get multiple user profiles for leaderboard
  async getLeaderboardProfiles(
    walletAddresses: string[]
  ): Promise<UserProfile[]> {
    try {
      const { data: orgsData, error } = await supabase
        .from('organizations')
        .select('wallet_address, name, logo_url, development_image_url')
        .in('wallet_address', walletAddresses)

      if (error) throw error

      // Create a map for quick lookup
      const orgMap = new Map(
        (orgsData || []).map((org) => [org.wallet_address, org])
      )

      // Return profiles for all requested addresses
      return walletAddresses.map((address) => {
        const org = orgMap.get(address)
        return {
          wallet_address: address,
          organization: org
            ? {
                name: org.name,
                logo_url: org.logo_url,
                development_image_url: org.development_image_url,
              }
            : undefined,
        }
      })
    } catch (error) {
      console.error('Error fetching leaderboard profiles:', error)
      return walletAddresses.map((address) => ({ wallet_address: address }))
    }
  },

  // Get user's avatar URL (prioritizes dev image in development)
  getAvatarUrl(profile: UserProfile): string | null {
    const isDev = process.env.NODE_ENV === 'development'

    // Try organization images first
    if (profile.organization) {
      if (isDev && profile.organization.development_image_url) {
        return profile.organization.development_image_url
      }
      if (profile.organization.logo_url) {
        return profile.organization.logo_url
      }
    }

    // Fallback to user avatar
    if (profile.avatar_url) {
      return profile.avatar_url
    }

    return null
  },
}
