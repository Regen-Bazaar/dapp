import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { UserAvatar } from './UserAvatar'
import { userService, UserProfile as UserProfileType } from '@/lib/userService'

interface UserProfileProps {
  currentUserProfile: UserProfileType | null
  walletAddress: string | null
  portfolioData?: {
    position: number
    ipCollection: number
    ipSold: number
    totalFunding: number
    referrals: number
  }
}

export function UserProfile({
  currentUserProfile,
  walletAddress,
  portfolioData = {
    position: 7,
    ipCollection: 32,
    ipSold: 19,
    totalFunding: 300,
    referrals: 29,
  },
}: UserProfileProps) {
  const avatarUrl = currentUserProfile
    ? userService.getAvatarUrl(currentUserProfile)
    : null

  return (
    <div className='h-fit w-full max-w-[404px] 2xl:min-w-90'>
      <Card className='h-full min-h-full rounded-[16px] border-[#101828] bg-[#272727] p-0 text-white'>
        <CardContent className='p-6'>
          <h2 className='mb-6 text-center text-2xl font-bold'>My Profile</h2>

          {/* Profile Avatar */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='flex flex-col items-center justify-center rounded-[15px] border border-[#101828] p-2'>
              <UserAvatar
                avatarUrl={avatarUrl}
                alt='Profile Avatar'
                size='lg'
                className='rounded-[15px] border border-[#101828]'
              />
            </div>
          </div>

          {/* Username */}
          <div className='mb-4 xl:mb-12'>
            <div className='flex items-center justify-center gap-2'>
              <span className='truncate font-mono text-lg'>
                {walletAddress || '0xdafea492d9c673...'}
              </span>
              <Image
                src='/cuida_copy-outline.png'
                alt='Copy'
                width={20}
                height={20}
                className='h-5 w-5 cursor-pointer'
                onClick={() => {
                  if (walletAddress) {
                    navigator.clipboard.writeText(walletAddress)
                  }
                }}
              />
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className='w-full'>
            <h3 className='mb-6 text-sm'>Portfolio overview</h3>
            <div className='flex flex-col gap-4 rounded-md bg-white p-3 text-black'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-black'>
                  LEADERBOARD POSITION
                </span>
                <span className='text-[#8C8C8C]'>{portfolioData.position}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>IP COLLECTION</span>
                <span className='text-[#8C8C8C]'>
                  {portfolioData.ipCollection}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>IP SOLD</span>
                <span className='text-[#8C8C8C]'>{portfolioData.ipSold}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>TOTAL QUADRATIC FUNDING</span>
                <span className='text-[#8C8C8C]'>
                  ${portfolioData.totalFunding}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>REFERRALS</span>
                <span className='text-[#8C8C8C]'>
                  {portfolioData.referrals}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
