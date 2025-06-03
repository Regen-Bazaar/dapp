import { ethers } from 'ethers'
import { getProvider } from '../web3'

const DEPOSIT_VAULT_ADDRESS = '0x3dB4D3DE3A936A4D332c05eA62014C5Cfe0270C8'
const DEPOSIT_VAULT_ABI = [
  'function deposit() public payable',
  'function withdraw(uint256 _amount) public',
  'function getBalance(address _user) public view returns (uint256)',
  'function getContractBalance() public view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
]

class DepositVaultService {
  private contract: ethers.Contract | null = null

  private async getContract(): Promise<ethers.Contract> {
    if (this.contract) return this.contract

    const provider = getProvider()
    if (!provider) {
      throw new Error('No provider available')
    }

    const signer = await provider.getSigner()
    this.contract = new ethers.Contract(
      DEPOSIT_VAULT_ADDRESS,
      DEPOSIT_VAULT_ABI,
      signer
    )
    return this.contract
  }

  async deposit(amount: string): Promise<ethers.TransactionResponse> {
    try {
      const contract = await this.getContract()
      const parsedAmount = ethers.parseEther(amount)

      // Send the transaction
      const tx = await contract.deposit({
        value: parsedAmount,
        gasLimit: 100000, // Set a reasonable gas limit
      })

      return tx
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user')
      }
      throw error
    }
  }

  async getBalance(address: string): Promise<string> {
    const contract = await this.getContract()
    const balance = await contract.getBalance(address)
    return ethers.formatEther(balance)
  }

  async getContractBalance(): Promise<string> {
    const contract = await this.getContract()
    const balance = await contract.getContractBalance()
    return ethers.formatEther(balance)
  }
}

export const depositVault = new DepositVaultService()
