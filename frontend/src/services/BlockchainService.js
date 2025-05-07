import { ethers } from 'ethers';

// ✅ Load Environment Variables
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const API_BASE_URL = "http://127.0.0.1:5000";

if (!INFURA_KEY) {
  throw new Error("❌ Missing INFURA API Key. Please check your .env file.");
}

// ✅ Set Up Provider
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_KEY}`);

// ✅ List of Verified Smart Contracts
const VERIFIED_CONTRACTS = ['0xdac17f958d2ee523a2206206994597c13d831ec7'];

// ✅ Helper Functions
const isValidEthereumAddress = (address) => ethers.isAddress(address);
const formatEtherValue = (weiValue) => parseFloat(ethers.formatEther(weiValue)).toFixed(6);
const formatGweiValue = (weiValue) => parseFloat(ethers.formatUnits(weiValue, "gwei")).toFixed(6);

// ✅ Fetch Transaction from Blockchain
const getTransaction = async (txHash) => {
  try {
    console.log(`🔍 Fetching transaction details for: ${txHash}`);

    if (!txHash || typeof txHash !== "string") throw new Error("❌ Invalid transaction hash.");

    const transaction = await provider.getTransaction(txHash);
    if (!transaction) throw new Error("❌ Transaction not found.");

    const block = await provider.getBlock(transaction.blockNumber);
    const timestamp = block?.timestamp || Math.floor(Date.now() / 1000);

    const txData = {
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to || "N/A",
      value: formatEtherValue(transaction.value),
      gasPrice: formatGweiValue(transaction.gasPrice),
      ageHours: ((Date.now() / 1000 - timestamp) / 3600).toFixed(2),
    };

    console.log("✅ Transaction Data:", txData);
    return txData;
  } catch (error) {
    console.error("❌ Error fetching transaction:", error);
    return null;
  }
};

// ✅ Fraud Risk Analysis (Rule-based + AI-based)
const checkFraudRisk = async (txData) => {
  try {
    console.log("🔍 Analyzing fraud risk for transaction:", txData);

    if (!isValidEthereumAddress(txData.from)) throw new Error(`❌ Invalid sender address: ${txData.from}`);
    if (txData.to && !isValidEthereumAddress(txData.to)) throw new Error(`❌ Invalid recipient address: ${txData.to}`);

    const senderTxCount = await provider.getTransactionCount(txData.from);
    const recentTxs = await provider.getLogs({ fromBlock: 'latest', address: txData.from });

    // ✅ Define Risk Rules
    const SEPOLIA_RULES = { HIGH_VALUE: 0.3, HIGH_GAS: 3, NEW_ACCOUNT: 3, FREQUENT_TX: 5 };
    let ruleBasedRisk = 0;
    const flags = {};

    const value = parseFloat(txData.value);
    const gasPrice = parseFloat(txData.gasPrice);

    // ✅ Rule-based Detection
    if (value === 0) {
      ruleBasedRisk += 45;
      flags.zeroValue = "Zero transaction value";
    }
    
    if (txData.to && !VERIFIED_CONTRACTS.includes(txData.to)) {
      ruleBasedRisk += 30;
      flags.unverifiedContract = "Unverified contract address";
    }
    
    if (value > SEPOLIA_RULES.HIGH_VALUE) {
      ruleBasedRisk += 40;
      flags.highValue = "High-value transaction";
    }
    
    if (gasPrice <= 10) {
      // No risk added
    } else if (gasPrice <= 30) {
      ruleBasedRisk += 15;
      flags.gasPriceTier = "Moderate Gas Cost";
    } else if (gasPrice <= 50) {
      ruleBasedRisk += 24;
      flags.gasPriceTier = "High Gas Cost";
    } else {
      ruleBasedRisk += 35;
      flags.gasPriceTier = "Very High Gas Cost";
    }
    
    
    if (senderTxCount < SEPOLIA_RULES.NEW_ACCOUNT) {
      ruleBasedRisk += 30;
      flags.newAccount = "Suspicious new account";
    }
    
    if (recentTxs.length > SEPOLIA_RULES.FREQUENT_TX) {
      ruleBasedRisk += 25;
      flags.frequentTransactions = "Frequent transactions in short time";
    }

    const ageWeight = Math.max(0, 10 - (parseFloat(txData.ageHours) / 3));
    ruleBasedRisk += ageWeight;

    if (parseFloat(txData.ageHours) > 3 && ruleBasedRisk > 20) {
      ruleBasedRisk += 10;
      flags.oldTransaction = "Transaction older than 3 hours";
    }

    console.log("✅ Rule-based Risk Score:", ruleBasedRisk, "Flags:", flags);

    // ✅ AI-Based Prediction
    const aiPrediction = await getAIPrediction(txData);

    const result = {
      ruleBasedRisk: Math.min(ruleBasedRisk, 100).toFixed(2),
      aiBasedRisk: aiPrediction.fraud_probability.toFixed(2),
      isFraud: aiPrediction.is_fraud,
      flags
    };

    console.log("✅ Final Fraud Analysis:", result);
    return result;
  } catch (error) {
    console.error("❌ Fraud analysis failed:", error);
    return { ruleBasedRisk: "0%", aiBasedRisk: "0%", isFraud: false, flags: {} };
  }
};

// ✅ Function to Call Flask API for AI-based Fraud Detection
const getAIPrediction = async (txData) => {
  try {
    console.log("📡 Sending transaction data to AI model for fraud prediction...");

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_value_eth: txData.value,
        gas_price_gwei: txData.gasPrice,
        time_since_last_tx: txData.ageHours,
        num_transactions_per_address: 50, 
        account_age_days: 365, 
        gas_fee_ratio: 0.02
      })
    });

    if (!response.ok) {
      throw new Error("❌ AI model prediction failed.");
    }

    const prediction = await response.json();
    console.log("✅ AI Model Response:", prediction);
    return prediction;
  } catch (error) {
    console.error("❌ AI prediction error:", error);
    return { is_fraud: false, fraud_probability: 0 };
  }
};

// ✅ Export Service
const BlockchainService = { checkFraudRisk, getTransaction };
export default BlockchainService;