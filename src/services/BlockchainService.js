import { ethers } from 'ethers';

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${INFURA_KEY}`
);

const VERIFIED_CONTRACTS = [
  '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
];

export const getTransaction = async (txHash) => {
  if (!txHash?.startsWith('0x') || txHash.length !== 66) {
    throw new Error('Invalid transaction hash');
  }

  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) throw new Error('Transaction not found');
    
    const block = await provider.getBlock(tx.blockNumber);
    const txAgeHours = (Date.now() - block.timestamp * 1000) / 3600000;

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to?.toLowerCase(), // Normalize to lowercase
      value: ethers.formatEther(tx.value),
      gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
      timestamp: block.timestamp,
      ageHours: txAgeHours.toFixed(2)
    };
  } catch (error) {
    console.error('Transaction fetch error:', error);
    throw new Error(error.reason || error.message);
  }
};

export const checkFraudRisk = async (txData) => {
  try {
    const senderTxCount = await provider.getTransactionCount(txData.from);
    const recentTxs = await provider.getLogs({
      fromBlock: 'latest',
      address: txData.from
    });

    const SEPOLIA_RULES = {
      HIGH_VALUE: 0.3,
      HIGH_GAS: 3,
      NEW_ACCOUNT: 3,
      FREQUENT_TX: 5
    };

    let risk = 0;
    const flags = {};
    const value = parseFloat(txData.value);
    const gasPrice = parseFloat(txData.gasPrice);

    // Zero-value detection
    if (value === 0) {
      risk += 45;
      flags.zeroValue = true;
    }

    // Contract check
    if (txData.to && !VERIFIED_CONTRACTS.includes(txData.to)) {
      risk += 30;
      flags.unverifiedContract = true;
    }

    // Value check
    if (value > SEPOLIA_RULES.HIGH_VALUE) {
      risk += 40;
      flags.highValue = true;
    }

    // Gas price check
    if (gasPrice > SEPOLIA_RULES.HIGH_GAS) {
      risk += 35;
      flags.highGas = true;
    }

    // Account newness check
    if (senderTxCount < SEPOLIA_RULES.NEW_ACCOUNT) {
      risk += 30;
      flags.newAccount = true;
    }

    // Transaction frequency check
    if (recentTxs.length > SEPOLIA_RULES.FREQUENT_TX) {
      risk += 25;
      flags.frequentTransactions = true;
    }

    // Round number check
    if (value % 1 === 0) {
      risk += 15;
      flags.roundNumber = true;
    }

    // Transaction age check with dynamic weighting
    const ageWeight = Math.max(0, 10 - (txData.ageHours / 3));
    risk += ageWeight;

    // Additional flag for old transactions if risk is already high
    if (txData.ageHours > 3 && risk > 20) {
      risk += 10;
      flags.oldTransaction = true;
    }

    console.log('Risk Calculation:', { risk, flags });

    return {
      risk: Math.min(risk, 100).toFixed(2),
      flags,
      ageHours: txData.ageHours
    };
  } catch (error) {
    console.error('Fraud analysis failed:', error);
    return { risk: 0, flags: {}, ageHours: 0 };
  }
};