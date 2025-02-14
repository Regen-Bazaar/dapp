import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProvider } from '../lib/web3';
import { Loader2, Lock, Calendar, ArrowUpRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../lib/projectService';
import { depositVault } from '../lib/contracts/depositVault';

interface AvailableProduct {
  id: string;
  title: string;
  description: string;
  impact_value: number;
  purchase_id: string;
  organization: {
    name: string;
    logo_url: string;
  };
}

interface StakedImpactProduct {
  id: string;
  number: string;
  iv_locked: number;
  apr: number;
  voting_power: number;
  lock_end_date: string;
  status: string;
}

interface StakedToken {
  id: string;
  number: string;
  amount_locked: number;
  apr: number;
  voting_power: number;
  lock_end_date: string;
  status: string;
}

const Stake = () => {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [stakedImpactProducts, setStakedImpactProducts] = useState<StakedImpactProduct[]>([]);
  const [stakedTokens, setStakedTokens] = useState<StakedToken[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stakeAmount] = useState('0.01');

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const provider = getProvider();
        if (provider) {
          const accounts = await provider.send('eth_accounts', []);
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
            await Promise.all([
              fetchAvailableProducts(accounts[0]),
              fetchStakedImpactProducts(accounts[0]),
              fetchStakedTokens(accounts[0])
            ]);
          }
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
        toast.error('Failed to load staking data');
      } finally {
        setLoading(false);
      }
    };

    checkWallet();
  }, []);

  const fetchAvailableProducts = async (address: string) => {
    try {
      const purchases = await projectService.getUserPurchasesWithStakingStatus(address);
      
      // Filter to only unstaked purchases and transform to the required format
      const availableProducts = purchases
        .filter(purchase => !purchase.isStaked)
        .map(purchase => ({
          ...purchase.project,
          purchase_id: purchase.id
        }))
        .filter(Boolean);

      setAvailableProducts(availableProducts);
    } catch (error) {
      console.error('Error fetching available products:', error);
      toast.error('Failed to load available products');
    }
  };

  const fetchStakedImpactProducts = async (address: string) => {
    try {
      const stakes = await projectService.getStakedProjects(address);
      
      // Transform stake data into the required format
      const stakedProducts = stakes.map((stake: any) => ({
        id: stake.id,
        number: stake.purchase.project.id.slice(0, 6), // Use first 6 chars of project ID as number
        iv_locked: stake.iv_locked,
        apr: stake.apr,
        voting_power: stake.voting_power,
        lock_end_date: new Date(stake.lock_end_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        status: stake.status
      }));

      setStakedImpactProducts(stakedProducts);
    } catch (error) {
      console.error('Error fetching staked impact products:', error);
      toast.error('Failed to load staked impact products');
    }
  };

  const fetchStakedTokens = async (address: string) => {
    try {
      // For now, we'll keep using simulated data for tokens
      // This will be replaced with actual token staking data in the future
      setStakedTokens([
        {
          id: '1',
          number: '123',
          amount_locked: 14000,
          apr: 7.59,
          voting_power: 14,
          lock_end_date: '2025-12-14',
          status: 'active'
        },
        {
          id: '2',
          number: '124',
          amount_locked: 11000,
          apr: 7.59,
          voting_power: 11,
          lock_end_date: '2025-10-12',
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Error fetching staked tokens:', error);
      toast.error('Failed to load staked tokens');
    }
  };

  const handleStake = async (purchaseId: string) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // First make the deposit using the smart contract
      console.log("Attempting stake deposit with amount:", stakeAmount);
      const tx = await depositVault.deposit(stakeAmount);
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction confirmation with user feedback
      const receipt = await toast.promise(
        tx.wait(),
        {
          loading: 'Confirming stake transaction...',
          success: 'Stake deposit confirmed!',
          error: 'Stake transaction failed'
        }
      );

      // Then create the stake record in the database with the transaction hash
      const result = await projectService.stakeProject(purchaseId, receipt.hash);
      
      if (result.success) {
        // Refresh both available and staked lists
        if (walletAddress) {
          await Promise.all([
            fetchAvailableProducts(walletAddress),
            fetchStakedImpactProducts(walletAddress)
          ]);
        }
        toast.success('Successfully staked');
      } else {
        throw new Error(result.error || 'Failed to stake product');
      }
    } catch (error: any) {
      console.error('Error staking product:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds in wallet');
      } else {
        toast.error(error.message || 'Failed to stake product');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (stakeId: string) => {
    try {
      await projectService.withdrawStake(stakeId);
      
      // Refresh the staked products list
      if (walletAddress) {
        await Promise.all([
          fetchAvailableProducts(walletAddress),
          fetchStakedImpactProducts(walletAddress)
        ]);
      }
      toast.success('Successfully withdrawn');
    } catch (error: any) {
      console.error('Error withdrawing stake:', error);
      toast.error(error.message || 'Failed to withdraw');
    }
  };

  const handleClaim = async (purchaseId: string) => {
    try {
      // Implement claim logic here
      toast.success('Claim initiated');
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  const handleLock = async (purchaseId: string) => {
    try {
      // Implement lock logic here
      toast.success('Lock initiated');
    } catch (error) {
      console.error('Error locking product:', error);
      toast.error('Failed to lock product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#B4F481] animate-spin" />
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">Please connect your wallet to view staking options</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-6xl font-bold text-[#B4F481] mb-12">STAKING DASHBOARD</h1>

        {/* Available to Stake Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 bg-black p-4">
            AVAILABLE TO STAKE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableProducts.map((product) => (
              <div
                key={`available-${product.purchase_id}`}
                className="bg-black border border-gray-800 rounded-lg overflow-hidden"
                onMouseEnter={() => setHoveredItem(`available-${product.purchase_id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="aspect-square relative">
                  {product.organization?.logo_url ? (
                    <img
                      src={product.organization.logo_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Shield className="h-12 w-12 text-[#B4F481] opacity-50" />
                    </div>
                  )}
                  {hoveredItem === `available-${product.purchase_id}` && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleClaim(product.purchase_id)}
                        className="px-4 py-2 bg-[#1A2F1D] text-[#B4F481] rounded hover:bg-[#2A462C] transition-colors"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => handleStake(product.purchase_id)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-[#1A2F1D] text-[#B4F481] rounded hover:bg-[#2A462C] transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Staking...
                          </span>
                        ) : (
                          'Stake'
                        )}
                      </button>
                      <button
                        onClick={() => handleLock(product.purchase_id)}
                        className="px-4 py-2 bg-[#1A2F1D] text-[#B4F481] rounded hover:bg-[#2A462C] transition-colors"
                      >
                        Lock
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2">{product.title}</h3>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Impact Value</p>
                      <p className="text-[#B4F481]">{product.impact_value || 0.1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Organization</p>
                      <p className="text-[#B4F481]">{product.organization?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staked Impact Products Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 bg-black p-4">
            STAKED IMPACT PRODUCTS FOR $REBAZ APR REWARDS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stakedImpactProducts.map((product) => (
              <div
                key={`staked-impact-${product.id}`}
                className="bg-black border border-gray-800 rounded-lg p-6 relative"
                onMouseEnter={() => setHoveredItem(`staked-impact-${product.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[#B4F481]">#{product.number}</span>
                  <span className="text-white">IMPACT PRODUCT LOCK</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">IV locked:</p>
                    <p className="text-white">{product.iv_locked}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">APR:</p>
                    <p className="text-[#B4F481]">{product.apr}% <span className="text-gray-500">REBAZ</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Voting power:</p>
                    <p className="text-[#B4F481]">{product.voting_power} <span className="text-gray-500">voREBAZ</span></p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    lock end date: <span className="text-white">{product.lock_end_date}</span>
                  </p>
                  {hoveredItem === `staked-impact-${product.id}` && (
                    <button
                      onClick={() => handleWithdraw(product.id)}
                      className="px-4 py-2 bg-[#1A2F1D] text-[#B4F481] rounded hover:bg-[#2A462C] transition-colors"
                    >
                      withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staked Tokens Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6 bg-black p-4">
            STAKED $REBAZ TOKEN FOR VOTING POWER
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stakedTokens.map((token) => (
              <div
                key={`staked-token-${token.id}`}
                className="bg-black border border-gray-800 rounded-lg p-6 relative"
                onMouseEnter={() => setHoveredItem(`staked-token-${token.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[#B4F481]">#{token.number}</span>
                  <span className="text-white">TOKEN LOCK</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Amount locked:</p>
                    <p className="text-white">{token.amount_locked.toLocaleString()} <span className="text-gray-500">REBAZ</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">APR:</p>
                    <p className="text-[#B4F481]">{token.apr}% <span className="text-gray-500">REBAZ</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Voting power:</p>
                    <p className="text-[#B4F481]">{token.voting_power} <span className="text-gray-500">voREBAZ</span></p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    lock end date: <span className="text-white">{token.lock_end_date}</span>
                  </p>
                  {hoveredItem === `staked-token-${token.id}` && (
                    <button
                      onClick={() => handleWithdraw(token.id)}
                      className="px-4 py-2 bg-[#1A2F1D] text-[#B4F481] rounded hover:bg-[#2A462C] transition-colors"
                    >
                      withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;