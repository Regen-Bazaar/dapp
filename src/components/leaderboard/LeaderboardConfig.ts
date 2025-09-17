import {
  buyerLeaderboardData,
  sellerLeaderboardData,
} from '@/mocks/leaderboardData'

export type LeaderboardType = 'buyer' | 'seller'

export interface LeaderboardColumn {
  key: string
  label: string
  className?: string
  format?: (value: string | number) => string
}

export interface LeaderboardData {
  rank: number
  user: string
  [key: string]: string | number | boolean
}

export const LEADERBOARD_CONFIGS = {
  buyer: {
    title: 'Buyer Leaderboard',
    columns: [
      { key: 'rank', label: 'Rank', className: 'text-center' },
      { key: 'user', label: 'User', className: 'text-center' },
      {
        key: 'ip_owned',
        label: 'Number of IP owned',
        className: 'text-center',
      },
      {
        key: 'impact_score',
        label: 'Total Impact Score',
        className: 'text-center',
      },
      {
        key: 'rebaz_spent',
        label: '$REBAZ spent',
        className: 'text-center',
        format: (value) => `$${value}`,
      },
      {
        key: 'staked',
        label: 'Staked $REBAR',
        className: '',
        format: (value) => `$${value}`,
      },
    ] as LeaderboardColumn[],
    data: buyerLeaderboardData,
  },
  seller: {
    title: 'Seller Leaderboard',
    columns: [
      { key: 'rank', label: 'Rank', className: 'text-center' },
      { key: 'user', label: 'User', className: 'text-center' },
      { key: 'ip_created', label: 'IP Created', className: 'text-center' },
      {
        key: 'total_sales',
        label: 'Total Impact Generated',
        className: 'text-center',
      },
      {
        key: 'rebaz_earned',
        label: '$REBAZ earned',
        className: 'text-center',
        format: (value) => `$${value}`,
      },
      { key: 'ip_sold', label: 'Number of IP Sold', className: 'text-center' },
      {
        key: 'staked',
        label: 'Staked $REBAR',
        className: '',
        format: (value) => `$${value}`,
      },
    ] as LeaderboardColumn[],
    data: sellerLeaderboardData,
  },
}
