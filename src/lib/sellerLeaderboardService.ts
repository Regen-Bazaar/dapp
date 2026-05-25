import { supabase } from './supabase'

export interface SellerLeaderboardEntry {
  organizationId: string
  name: string
  logoUrl: string | null
  verified: boolean
  projectsSold: number
  totalRevenue: number
  buyerCount: number
}

export interface SellerLeaderboardFilters {
  /** Empty / 'all' returns sellers across all categories. */
  category?: string
  limit?: number
}

interface PurchaseJoinRow {
  buyer_address: string
  price: number | string | null
  project: {
    category: string
    organization: {
      id: string
      name: string
      logo_url: string | null
      verified: boolean
    } | null
  } | null
}

const DEFAULT_LIMIT = 25

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Aggregate purchases by organization to produce a "seller leaderboard".
 *
 * We pull active purchases joined to their project and organization, then
 * fold them by organization id. Aggregation is done client-side because the
 * REST API doesn't expose group-by; the dataset is small (top sellers only)
 * and the query is bounded by category. For larger scale this should be
 * promoted to a Postgres view or RPC.
 */
export const fetchSellerLeaderboard = async (
  filters: SellerLeaderboardFilters = {}
): Promise<SellerLeaderboardEntry[]> => {
  const limit = filters.limit ?? DEFAULT_LIMIT

  let query = supabase
    .from('purchases')
    .select(
      `buyer_address,
       price,
       project:projects!inner(
         category,
         organization:organizations(
           id, name, logo_url, verified
         )
       )`
    )
    .eq('status', 'active')

  if (filters.category && filters.category !== 'all') {
    query = query.eq('project.category', filters.category)
  }

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as PurchaseJoinRow[]
  const byOrg = new Map<
    string,
    SellerLeaderboardEntry & { buyers: Set<string> }
  >()

  for (const row of rows) {
    const org = row.project?.organization
    if (!org) continue

    let entry = byOrg.get(org.id)
    if (!entry) {
      entry = {
        organizationId: org.id,
        name: org.name,
        logoUrl: org.logo_url,
        verified: org.verified,
        projectsSold: 0,
        totalRevenue: 0,
        buyerCount: 0,
        buyers: new Set<string>(),
      }
      byOrg.set(org.id, entry)
    }

    entry.projectsSold += 1
    entry.totalRevenue += toNumber(row.price)
    if (row.buyer_address) entry.buyers.add(row.buyer_address)
  }

  return Array.from(byOrg.values())
    .map(({ buyers, ...rest }) => ({ ...rest, buyerCount: buyers.size }))
    .sort((a, b) => {
      if (b.totalRevenue !== a.totalRevenue)
        return b.totalRevenue - a.totalRevenue
      return b.projectsSold - a.projectsSold
    })
    .slice(0, limit)
}

/**
 * Fetch the distinct list of project categories available in the catalogue.
 * Used to populate the category filter on the seller leaderboard.
 */
export const fetchSellerCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('category')
    .not('category', 'is', null)

  if (error) throw error

  const set = new Set<string>()
  for (const row of (data ?? []) as { category: string | null }[]) {
    if (row.category) set.add(row.category)
  }
  return Array.from(set).sort()
}

/**
 * Subscribe to purchase events so the leaderboard can refresh in near
 * real-time. Returns an unsubscribe function.
 */
export const subscribeToPurchaseChanges = (
  onChange: () => void
): (() => void) => {
  const channel = supabase
    .channel('seller-leaderboard:purchases')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'purchases' },
      onChange
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
