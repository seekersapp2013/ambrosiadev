import express from 'express';
import cors from 'cors'; // ✅ Import cors
import Oathstone from './oathstone.js';

const app = express();
const PORT = 3001;

app.use(cors()); // ✅ Enable CORS for all origins

app.use(express.json()); // ✅ Add this line to parse JSON request body


const oathstone = new Oathstone();

// Root endpoint
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Ambrosia Service</h1><p>Use <code>/createWallet</code> to generate a wallet.</p>');
});

// Wallet creation endpoint
app.get('/createWallet', async (req, res) => {
  try {
    console.log('🔄 /createWallet requested...');

    const connected = await oathstone.connectNetworks();
    if (!connected) {
      console.error('❌ Failed to connect to networks.');
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to blockchain networks.',
      });
    }

    const wallet = oathstone.createWallet();
    if (!wallet) {
      console.error('❌ Failed to create wallet.');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate wallet.',
      });
    }

    console.log('\n📦 Wallet Created:');
    console.log(`🔐 Address:     ${wallet.address}`);
    console.log(`🗝️  Private Key: ${wallet.privateKey}`);
    console.log(`🧠 Mnemonic:    ${wallet.mnemonic}\n`);

    return res.status(200).json({
      success: true,
      message: 'Wallet successfully created',
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic,
      },
    });

  } catch (err) {
    console.error('❌ Unexpected server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});


app.post('/getBalance', async (req, res) => {
  try {
    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: privateKey',
      });
    }

    const connected = await oathstone.connectNetworks();
    if (!connected) {
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to blockchain networks.',
      });
    }

    const contractsLoaded = await oathstone.loadContracts();
    if (!contractsLoaded) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load token contracts.',
      });
    }

    const balances = {};

    for (const [network, config] of Object.entries(oathstone.config.networks)) {
      const web3 = oathstone.getWeb3(network);
      if (!web3) continue;

      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const address = account.address;

      let nativeBalance = null;
      try {
        nativeBalance = await oathstone.getNativeBalance(network, address);
      } catch (err) {
        console.warn(`⚠️ Failed to fetch native balance for ${network}:`, err.message);
      }

      const tokenBalances = {};
      const tokens = config.tokens || {};
      for (const tokenName of Object.keys(tokens)) {
        try {
          const tokenBalance = await oathstone.getTokenBalance(network, tokenName, address);
          tokenBalances[tokenName] = tokenBalance;
        } catch (err) {
          console.warn(`⚠️ Failed to fetch ${tokenName} balance on ${network}:`, err.message);
          tokenBalances[tokenName] = null;
        }
      }

      balances[network] = {
        address,
        native: nativeBalance,
        tokens: tokenBalances
      };
    }

    return res.status(200).json({
      success: true,
      balances
    });

  } catch (error) {
    console.error('❌ Error in /getBalance:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { privateKey, address, amount, type } = req.body;

    if (!privateKey || !address || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: privateKey, address, amount, type ("native" or "token")'
      });
    }

    const connected = await oathstone.connectNetworks();
    if (!connected) {
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to blockchain networks'
      });
    }

    const contractsLoaded = await oathstone.loadContracts();

    const web3 = oathstone.getWeb3(Object.keys(oathstone.config.networks)[0]);
    const fromAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
    const fromAddress = fromAccount.address;

    const results = {};

    for (const network of Object.keys(oathstone.config.networks)) {
      try {
        if (type === 'native') {
          const receipt = await oathstone.transferNative(
            network,
            fromAddress,
            privateKey,
            address,
            amount
          );
          results[network] = {
            success: true,
            message: 'Native transfer successful',
            txHash: receipt.transactionHash
          };
        } else if (type === 'token') {
          const tokens = Object.keys(oathstone.config.networks[network]?.tokens || {});
          for (const tokenName of tokens) {
            try {
              const receipt = await oathstone.transferToken(
                network,
                tokenName,
                fromAddress,
                privateKey,
                address,
                amount
              );
              results[`${network}-${tokenName}`] = {
                success: true,
                message: `Token ${tokenName} transfer successful`,
                txHash: receipt.transactionHash
              };
            } catch (tokenError) {
              results[`${network}-${tokenName}`] = {
                success: false,
                error: `Failed to transfer token ${tokenName} on ${network}: ${tokenError.message}`
              };
            }
          }
        } else {
          results[network] = {
            success: false,
            error: 'Invalid transfer type. Must be "native" or "token"'
          };
        }
      } catch (networkError) {
        results[network] = {
          success: false,
          error: `Transfer failed on ${network}: ${networkError.message}`
        };
      }
    }

    return res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ /transfer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
