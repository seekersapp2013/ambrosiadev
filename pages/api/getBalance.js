import { ethers } from 'ethers';

// Celo Mainnet RPC
const CELO_RPC = 'https://forno.celo.org';
// cUSD token contract address on Celo
const CUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { privateKey } = req.body;

  if (!privateKey) {
    return res.status(400).json({ error: 'Private key is required' });
  }

  try {
    // Connect to Celo network
    const provider = new ethers.JsonRpcProvider(CELO_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get native CELO balance
    const nativeBalance = await provider.getBalance(wallet.address);
    const nativeBalanceFormatted = ethers.formatEther(nativeBalance);

    // Get cUSD token balance
    const cusdContract = new ethers.Contract(
      CUSD_ADDRESS,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );

    let usdBalance = '0';
    try {
      const tokenBalance = await cusdContract.balanceOf(wallet.address);
      const decimals = await cusdContract.decimals();
      usdBalance = ethers.formatUnits(tokenBalance, decimals);
    } catch (tokenError) {
      console.warn('Could not fetch cUSD balance:', tokenError.message);
    }

    return res.status(200).json({
      success: true,
      balances: {
        celo: {
          address: wallet.address,
          native: nativeBalanceFormatted,
          tokens: {
            USD: usdBalance
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch balance' 
    });
  }
}