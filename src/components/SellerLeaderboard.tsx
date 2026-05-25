'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trophy, Award, Star, RefreshCw } from 'lucide-react'
import {
  SellerLeaderboardEntry,
  fetchSellerCategories,
  fetchSellerLeaderboard,
  subscribeToPurchaseChanges,
} from '@/lib/sellerLeaderboardService'

const ALL_CATEGORIES = 'all'

const rankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className='h-5 w-5 text-yellow-400' />
    case 2:
      return <Award className='h-5 w-5 text-gray-300' />
    case 3:
      return <Star className='h-5 w-5 text-amber-600' />
    default:
      return <span className='font-mono text-base text-gray-400'>{rank}</span>
  }
}

const formatNumber = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : '0'

export const SellerLeaderboard = () => {
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [categories, setCategories] = useState<string[]>([])
  const [entries, setEntries] = useState<SellerLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSellerLeaderboard({ category })
      setEntries(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load seller leaderboard'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    let cancelled = false
    fetchSellerCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats)
      })
      .catch(() => {
        /* category list is best-effort; fall back to "all" */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const unsubscribe = subscribeToPurchaseChanges(() => {
      void load()
    })
    return unsubscribe
  }, [load])

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...categories],
    [categories]
  )

  return (
    <div>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-2xl font-bold text-white'>Top Sellers</h2>
        <div className='flex items-center gap-2'>
          <label htmlFor='seller-category' className='text-sm text-gray-400'>
            Category
          </label>
          <select
            id='seller-category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-white focus:border-[#B4F481] focus:outline-none'
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c === ALL_CATEGORIES ? 'All categories' : c}
              </option>
            ))}
          </select>
          <button
            type='button'
            onClick={() => void load()}
            disabled={loading}
            className='inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50'
            aria-label='Refresh seller leaderboard'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50'>
        <div className='grid grid-cols-6 border-b border-gray-800 p-4 text-sm text-gray-400'>
          <div className='col-span-2'>Seller</div>
          <div className='text-right'>Projects sold</div>
          <div className='text-right'>Buyers</div>
          <div className='text-right'>Revenue</div>
          <div className='text-right'>Status</div>
        </div>

        {loading && entries.length === 0 ? (
          <div className='p-6 text-center text-gray-400' role='status'>
            Loading sellers…
          </div>
        ) : error ? (
          <div className='p-6 text-center text-red-400' role='alert'>
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className='p-6 text-center text-gray-400'>
            No sellers yet for this category.
          </div>
        ) : (
          entries.map((entry, idx) => {
            const rank = idx + 1
            return (
              <div
                key={entry.organizationId}
                className='grid grid-cols-6 items-center border-b border-gray-800 p-4 last:border-0 hover:bg-gray-800/50'
              >
                <div className='col-span-2 flex items-center space-x-3'>
                  <div className='flex w-8 justify-center'>
                    {rankIcon(rank)}
                  </div>
                  <span className='truncate text-white'>{entry.name}</span>
                </div>
                <div className='text-right text-gray-300'>
                  {entry.projectsSold}
                </div>
                <div className='text-right text-gray-300'>
                  {entry.buyerCount}
                </div>
                <div className='text-right text-[#B4F481]'>
                  {formatNumber(entry.totalRevenue)}
                </div>
                <div className='text-right text-xs'>
                  {entry.verified ? (
                    <span className='rounded-full bg-[#B4F481]/20 px-2 py-0.5 text-[#B4F481]'>
                      Verified
                    </span>
                  ) : (
                    <span className='text-gray-500'>—</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SellerLeaderboard
