import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    return res.status(200).json({
      success: true,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        mnemonic: wallet.mnemonic.phrase
      }
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create wallet' 
    });
  }
}