import { ethers } from 'ethers';

// Celo network configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const USD_TOKEN_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'; // cUSD on Celo mainnet

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { fromPrivateKey, toAddress, amount, token } = req.body;

    if (!fromPrivateKey || !toAddress || !amount || !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: fromPrivateKey, toAddress, amount, token' 
      });
    }

    // Connect to Celo network
    const provider = new ethers.JsonRpcProvider(CELO_RPC_URL);
    const wallet = new ethers.Wallet(fromPrivateKey, provider);

    let txHash;

    if (token === 'USD' || token === 'cUSD') {
      // Send USD token (cUSD)
      const usdTokenAbi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const usdContract = new ethers.Contract(USD_TOKEN_ADDRESS, usdTokenAbi, wallet);
      
      // Check balance first
      const balance = await usdContract.balanceOf(wallet.address);
      const decimals = await usdContract.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);

      if (balance < amountInWei) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient USD token balance. Required: ${amount}, Available: ${ethers.formatUnits(balance, decimals)}` 
        });
      }

      // Send USD token transaction
      const tx = await usdContract.transfer(toAddress, amountInWei);
      txHash = tx.hash;

      // Wait for confirmation
      await tx.wait();

    } else if (token === 'CELO') {
      // Send native CELO
      const amountInWei = ethers.parseEther(amount.toString());
      
      // Check balance first
      const balance = await provider.getBalance(wallet.address);
      if (balance < amountInWei) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient CELO balance. Required: ${amount}, Available: ${ethers.formatEther(balance)}` 
        });
      }

      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amountInWei
      });
      txHash = tx.hash;

      // Wait for confirmation
      await tx.wait();

    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported token: ${token}. Supported tokens: USD, cUSD, CELO` 
      });
    }

    console.log(`Payment successful: ${amount} ${token} sent to ${toAddress}, tx: ${txHash}`);

    return res.status(200).json({
      success: true,
      txHash: txHash,
      message: `Successfully sent ${amount} ${token} to ${toAddress}`
    });

  } catch (error) {
    console.error('Payment error:', error);
    
    let errorMessage = 'Payment transaction failed';
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in wallet';
    } else if (error.message.includes('invalid address')) {
      errorMessage = 'Invalid recipient address';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network connection error';
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
}