import { ethers } from 'ethers';

// Celo Mainnet RPC
const CELO_RPC = 'https://forno.celo.org';
// cUSD token contract address on Celo
const CUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { privateKey, address, amount, type } = req.body;

  if (!privateKey || !address || !amount || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Connect to Celo network
    const provider = new ethers.JsonRpcProvider(CELO_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);

    let txResponse;

    if (type === 'native') {
      // Send native CELO
      const tx = {
        to: address,
        value: ethers.parseEther(amount.toString()),
      };
      
      txResponse = await wallet.sendTransaction(tx);
    } else if (type === 'token') {
      // Send cUSD token
      const cusdContract = new ethers.Contract(
        CUSD_ADDRESS,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        wallet
      );

      const decimals = await cusdContract.decimals();
      const tokenAmount = ethers.parseUnits(amount.toString(), decimals);
      
      txResponse = await cusdContract.transfer(address, tokenAmount);
    } else {
      return res.status(400).json({ error: 'Invalid transfer type' });
    }

    // Wait for transaction confirmation
    const receipt = await txResponse.wait();

    return res.status(200).json({
      success: true,
      transaction: {
        hash: txResponse.hash,
        from: wallet.address,
        to: address,
        amount: amount,
        type: type,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send transaction' 
    });
  }
}