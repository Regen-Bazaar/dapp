import { supabase } from './supabase'
import toast from 'react-hot-toast'

export interface PurchaseResult {
  success: boolean
  purchaseId?: string
  error?: string
  transactionHash?: string
}

export interface StakeResult {
  success: boolean
  stakeId?: string
  error?: string
  transactionHash?: string
}

export interface ProjectData {
  title: string
  description: string
  category: string
  funding_goal: number
  start_date: string
  organization_id: string
  wallet_address: string
  transaction_hash: string
  impact_value?: number
}

// Helper function to generate random values
const generateRandomValues = () => {
  // Generate random price between 0.0001 and 0.0009
  const randomPrice = Number(
    (Math.random() * (0.0009 - 0.0001) + 0.0001).toFixed(4)
  )

  // Generate random impact value between 1 and 10
  const randomImpact = Math.floor(Math.random() * 10) + 1

  return { price: randomPrice, impact: randomImpact }
}

export const projectService = {
  // Purchase a project
  async purchaseProject(
    projectId: string,
    buyerAddress: string,
    price: number,
    transactionHash?: string
  ): Promise<PurchaseResult> {
    try {
      // First, create the purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          project_id: projectId,
          buyer_address: buyerAddress,
          price: price,
          status: 'active',
          transaction_hash: transactionHash, // Store the transaction hash
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Then update the project's current funding
      const { error: updateError } = await supabase.rpc(
        'update_project_funding',
        {
          p_project_id: projectId,
          p_amount: price,
        }
      )

      if (updateError) throw updateError

      return {
        success: true,
        purchaseId: purchase.id,
        transactionHash,
      }
    } catch (error: any) {
      console.error('Error purchasing project:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Create a new project with transaction details and random values
  async createProject(
    projectData: ProjectData
  ): Promise<{ success: boolean; project?: any; error?: string }> {
    try {
      const { price, impact } = generateRandomValues()

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          funding_goal: price,
          impact_value: impact,
          status: 'active',
          current_funding: 0,
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        project: data,
      }
    } catch (error: any) {
      console.error('Error creating project:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Get user's purchased projects with staking status
  async getUserPurchasesWithStakingStatus(walletAddress: string) {
    try {
      // Get all active purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(
          `
          id,
          price,
          status,
          transaction_hash,
          created_at,
          project:projects(
            id,
            title,
            description,
            funding_goal,
            current_funding,
            impact_value,
            transaction_hash,
            organization:organizations(
              name,
              logo_url,
              username
            )
          )
        `
        )
        .eq('buyer_address', walletAddress)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (purchasesError) throw purchasesError

      // Get all staked purchase IDs
      const { data: stakes, error: stakesError } = await supabase
        .from('stakes')
        .select('purchase_id, transaction_hash')
        .eq('status', 'active')

      if (stakesError) throw stakesError

      // Create a set of staked purchase IDs for efficient lookup
      const stakedPurchaseIds = new Set(stakes?.map((s) => s.purchase_id) || [])

      // Add staking status to each purchase
      const purchasesWithStakingStatus = (purchases || []).map((purchase) => ({
        ...purchase,
        isStaked: stakedPurchaseIds.has(purchase.id),
      }))

      return purchasesWithStakingStatus
    } catch (error) {
      console.error('Error fetching user purchases:', error)
      throw error
    }
  },

  // Get user's staked projects
  async getStakedProjects(walletAddress: string) {
    try {
      const { data: stakes, error } = await supabase
        .from('stakes')
        .select(
          `
          id,
          iv_locked,
          apr,
          voting_power,
          lock_end_date,
          status,
          transaction_hash,
          purchase:purchases(
            id,
            buyer_address,
            transaction_hash,
            project:projects(
              id,
              title,
              description,
              impact_value,
              transaction_hash,
              organization:organizations(name, logo_url)
            )
          )
        `
        )
        .eq('status', 'active')
        .eq('purchase.buyer_address', walletAddress)

      if (error) throw error

      return stakes || []
    } catch (error) {
      console.error('Error fetching staked projects:', error)
      throw error
    }
  },

  // Stake a purchased project
  async stakeProject(
    purchaseId: string,
    transactionHash?: string,
    lockPeriodDays: number = 90
  ): Promise<StakeResult> {
    try {
      // First check if purchase exists and is not already staked
      const { data: stakes, error: checkError } = await supabase
        .from('stakes')
        .select('id')
        .eq('purchase_id', purchaseId)
        .eq('status', 'active')

      if (checkError) throw checkError

      if (stakes && stakes.length > 0) {
        return {
          success: false,
          error: 'This purchase is already staked',
        }
      }

      // Calculate APR based on lock period
      const baseAPR = 12 // 12% base APR
      const aprMultiplier = lockPeriodDays / 30 // Higher APR for longer locks
      const finalAPR = Math.min(baseAPR * aprMultiplier, 27.23) // Cap at 27.23%

      // Calculate voting power
      const baseVotingPower = 10
      const votingPowerMultiplier = lockPeriodDays / 30
      const finalVotingPower = Math.floor(
        baseVotingPower * votingPowerMultiplier
      )

      // Create the stake
      const { data: stake, error: stakeError } = await supabase
        .from('stakes')
        .insert([
          {
            purchase_id: purchaseId,
            iv_locked: 1,
            apr: finalAPR,
            voting_power: finalVotingPower,
            lock_end_date: new Date(
              Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: 'active',
            transaction_hash: transactionHash,
          },
        ])
        .select()
        .limit(1)

      if (stakeError) throw stakeError

      if (!stake || stake.length === 0) {
        throw new Error('Failed to create stake record')
      }

      return {
        success: true,
        stakeId: stake[0].id,
        transactionHash,
      }
    } catch (error: any) {
      console.error('Error staking project:', error)
      return {
        success: false,
        error: error.message || 'Failed to stake project',
      }
    }
  },

  // Withdraw a staked project
  async withdrawStake(
    stakeId: string,
    transactionHash?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stakes')
        .update({
          status: 'withdrawn',
          transaction_hash: transactionHash,
        })
        .eq('id', stakeId)
        .select()
        .single()

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error withdrawing stake:', error)
      throw error
    }
  },
}
