import { LeaderboardType } from './LeaderboardConfig'

interface LeaderboardToggleProps {
  currentType: LeaderboardType
  onTypeChange: (type: LeaderboardType) => void
}

export function LeaderboardToggle({
  currentType,
  onTypeChange,
}: LeaderboardToggleProps) {
  return (
    <div className='mb-6 flex items-center justify-center'>
      <div className='flex rounded-lg bg-gray-200 p-1'>
        <button
          onClick={() => onTypeChange('buyer')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            currentType === 'buyer'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Buyer Leaderboard
        </button>
        <button
          onClick={() => onTypeChange('seller')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            currentType === 'seller'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Seller Leaderboard
        </button>
      </div>
    </div>
  )
}
