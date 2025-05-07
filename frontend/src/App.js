import { useState, useEffect } from "react";
import BlockchainService from "./services/BlockchainService";
import "./App.css";
import logo from "./assets/logo.png";

const { getTransaction, checkFraudRisk } = BlockchainService;

function App() {
  const [txHash, setTxHash] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [fraudRisk, setFraudRisk] = useState(0);
  const [fraudFlags, setFraudFlags] = useState({});
  const [error, setError] = useState("");
  const [isHeaderAbsolute, setIsHeaderAbsolute] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 600;
      const scrollTop = window.scrollY;
      setIsHeaderAbsolute(scrollTop > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async () => {
    try {
      setError("");
      setTransaction(null);
      setFraudRisk(0);
      setFraudFlags({});

      const txData = await getTransaction(txHash.trim());
      if (!txData || !txData.hash) {
        throw new Error("Transaction not found. Please check the hash.");
      }

      setTransaction(txData);

      const fraudResult = await checkFraudRisk(txData);
      setFraudRisk(fraudResult?.ruleBasedRisk || 0);
      setFraudFlags(fraudResult?.flags || {});
    } catch (err) {
      setError(err.message || "An error occurred while fetching the transaction.");
      setTransaction(null);
      setFraudRisk(0);
      setFraudFlags({});
    }
  };

  return (
    <div className="App">
      {/* Floating Header */}
      <div className={`floating-header ${isHeaderAbsolute ? "absolute" : ""}`}>
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="header-right">
          <p>DeFi Sentinel</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <video autoPlay muted loop className="background-video">
          <source src={require("./assets/bg.mp4")} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay-content">
          <p className="project-caption">Smart Surveillance for Safer Blockchains</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="main-section">
        {/* Two-column White Box */}
        <div className="white-content-box two-column">
          {/* Left Side - Project Summary */}
          <div className="left-summary">
            <h2>🟦 Project Overview</h2>
            <p>
              <strong>DeFi Sentinel</strong> is an AI-powered blockchain surveillance system built to analyze <strong>Ethereum</strong>-based transactions 
              (currently supporting the Sepolia testnet) in real-time and detect potential fraud or suspicious behavior. This system empowers 
              DeFi users, developers, and auditors with a transparent layer of protection using a rule-based engine and machine learning insights.
            </p>

            <h3>🔍 Core Features:</h3>
            <ul>
              <li>✅ <strong>Live Transaction Analysis:</strong> Input a transaction hash to get instant insights into sender, receiver, gas usage, and value.</li>
              <li>🚨 <strong>Fraud Risk Detection:</strong> Automatically assigns a risk score based on rule-based logic and heuristics.</li>
              <li>🧠 <strong>AI Integration Ready:</strong> Designed to integrate ML models like Logistic Regression and XGBoost for predictive accuracy.</li>
              <li>🛠️ <strong>Developer-Friendly Design:</strong> Lightweight React frontend with REST API architecture for easy extensibility.</li>
              <li>🔒 <strong>Focused on DeFi Security:</strong> Specially optimized for detecting fraud in decentralized financial ecosystems.</li>
            </ul>

            <h3>🎯 Project Goal:</h3>
            <p>
              To build an open, accessible, and transparent fraud detection tool for blockchain platforms. By empowering users to check risk 
              in real-time, <strong>DeFi Sentinel</strong> helps create safer blockchain interactions and strengthens user trust in decentralized ecosystems.
            </p>

            {/* Sepolia Link Line */}
            <div className="get-hash-section">
            <h2>
            🔗Get Ethereum Transaction Hash IDs:{" "}
                <a
                  href="https://sepolia.etherscan.io/txs?ps=100&p=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sepolia-button-inline"
                >
                  Sepolia
                </a>
              </h2>
            </div>
          </div>

          {/* Right Side - Gray Box */}
          <div className="gray-box">
            <h1>Transaction Analysis</h1>
            <div className="search-box">
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Enter Sepolia transaction hash (0x...)"
                className="hash-input"
              />
              <button onClick={handleSearch} className="analyze-btn">
                Analyze
              </button>
            </div>

            {/* Error Message */}
            {error && <div className="error">{error}</div>}

            {/* Transaction Details */}
            {transaction && (
              <div className="tx-info">
                <div><span>Hash ID:</span> {transaction.hash}</div>
                <div><span>From Add:</span> {transaction.from}</div>
                <div><span>To Add:</span> {transaction.to || "Contract Creation"}</div>
                <div><span>Value of TXN:</span> {transaction.value} ETH</div>
                <div><span>Gas Price:</span> {transaction.gasPrice} Gwei</div>
                <div><span>Age of TXN:</span> {transaction.ageHours} hours</div>
              </div>
            )}

            {/* Fraud Risk & Flags */}
            {transaction && (
              <>
                <div className={`risk-indicator ${ fraudRisk > 80 ? "high-risk" : fraudRisk > 60 ? "medium-risk" : "low-risk"}`}>
                  Fraud Risk: <strong>{fraudRisk}%</strong>
                </div>

                {Object.keys(fraudFlags).length > 0 && (
                  <div className="fraud-flags">
                    <h1>Detected Fraud Flags</h1>
                    <ul>
                      {Object.entries(fraudFlags).map(([key, value]) => (
                        <li key={key}>{typeof value === "string" ? value : key}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Footer Image Layer */}
      <div
        className="footer-image"
        style={{
          marginTop: "700px",
          width: "100%",     // You can set custom number like '1200px'
          height: "200px",    // You can set custom number like '300px'
          transform: "scale(0.9)",
          backgroundImage: `url(${require("./assets/footer.jpg")})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>
    </div>
  
    
  );
}

export default App;
