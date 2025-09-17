import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from './UserAvatar'
import { LeaderboardColumn, LeaderboardData } from './LeaderboardConfig'

interface LeaderboardTableProps {
  columns: LeaderboardColumn[]
  data: LeaderboardData[]
  getAvatarUrl: (userAddress: string) => string | null
}

export function LeaderboardTable({
  columns,
  data,
  getAvatarUrl,
}: LeaderboardTableProps) {
  return (
    <div className='w-full max-w-full overflow-hidden'>
      <div className='scrollbar-hide w-full max-w-full overflow-x-scroll'>
        <div className='max-w-full min-w-7xl p-0 2xl:w-full'>
          <Card className='h-full min-h-full rounded-[16px] border-none bg-white p-0'>
            <CardContent className='p-0'>
              {/* Header */}
              <div className='rounded-xl bg-[#272727] text-white'>
                <div
                  className={`grid gap-4 p-4 text-sm font-semibold uppercase ${
                    columns.length === 7 ? 'grid-cols-7' : 'grid-cols-6'
                  }`}
                >
                  {columns.map((column) => (
                    <div key={column.key} className={column.className}>
                      {column.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Leaderboard Rows */}
              <div className='mt-2 flex flex-col gap-2'>
                {data.map((item) => {
                  const avatarUrl = getAvatarUrl(item.user)
                  return (
                    <div
                      key={item.rank}
                      className={`grid items-center gap-4 rounded-xl bg-[#D9E0EC33] p-1.5 text-black transition-all duration-100 hover:bg-gray-50 hover:outline hover:outline-black ${columns.length === 7 ? 'grid-cols-14' : 'grid-cols-12'}`}
                    >
                      {/* Rank */}
                      <div className='bg-[#ECF9F033] text-center text-lg font-bold text-black'>
                        {item.rank}
                      </div>
                      {/* User */}
                      <div className='col-span-3 col-start-2 flex items-center gap-2 text-black'>
                        <UserAvatar
                          avatarUrl={avatarUrl}
                          alt='Avatar'
                          size='md'
                          className='min-h-[40px] min-w-[40px] p-0'
                        />
                        <span className='truncate text-sm font-semibold'>
                          {item.user}
                        </span>
                      </div>
                      {columns.slice(2).map((column) => (
                        <div
                          key={column.key}
                          className={`text-center font-semibold ${columns.length === 7 ? 'col-span-2' : 'col-span-2'}`}
                        >
                          {column.format
                            ? column.format(item[column.key] as string | number)
                            : (item[column.key] as string | number)}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
