'use client'

import { useEffect, useState } from 'react'
import { userService, UserProfile } from '@/lib/userService'
import { useWallet } from '@/context/WalletContext'
import { UserProfile as UserProfileComponent } from './UserProfile'
import { LeaderboardTable } from './LeaderboardTable'

import {
  LEADERBOARD_CONFIGS,
  LeaderboardData,
  LeaderboardType,
} from './LeaderboardConfig'

interface LeaderboardMainProps {
  type?: LeaderboardType
}

export function LeaderboardMain({ type = 'buyer' }: LeaderboardMainProps) {
  const { walletAddress } = useWallet()
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const currentConfig = LEADERBOARD_CONFIGS[type]

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Extract wallet addresses from leaderboard data
        const walletAddresses = currentConfig.data.map(
          (item: LeaderboardData) => item.user
        )

        // Fetch profiles for all users in leaderboard
        const profiles =
          await userService.getLeaderboardProfiles(walletAddresses)
        console.log('profiles', profiles)
        setUserProfiles(profiles)

        // Fetch current user profile if wallet is connected
        if (walletAddress) {
          const currentProfile = await userService.getUserProfile(walletAddress)
          setCurrentUserProfile(currentProfile)
        }
      } catch (error) {
        console.error('Error fetching profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [walletAddress, type, currentConfig.data])

  const getUserProfile = (userAddress: string) => {
    return userProfiles.find(
      (profile) => profile.wallet_address === userAddress
    )
  }

  const getAvatarUrl = (userAddress: string) => {
    const profile = getUserProfile(userAddress)
    if (profile) {
      return userService.getAvatarUrl(profile)
    }
    return null
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#F8F4E4] p-4'>
        <div className='mx-auto flex max-w-screen-2xl items-center justify-center py-10'>
          <div className='text-lg text-black'>Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#F8F4E4] p-4'>
      <div className='mx-auto w-full max-w-fit'>
        <div className='flex flex-col items-center gap-3 rounded-2xl bg-white px-3 pt-3 md:flex-row md:items-start md:pr-0 md:pl-3'>
          <UserProfileComponent
            currentUserProfile={currentUserProfile}
            walletAddress={walletAddress}
          />

          <LeaderboardTable
            columns={currentConfig.columns}
            data={currentConfig.data}
            getAvatarUrl={getAvatarUrl}
          />
        </div>
      </div>
    </div>
  )
}
