import { useState } from "react";
import { getTransaction, checkFraudRisk } from "./services/BlockchainService";
import "./App.css";

function App() {
  const [txHash, setTxHash] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [fraudRisk, setFraudRisk] = useState(0);
  const [fraudFlags, setFraudFlags] = useState({});
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setError("");
      setFraudRisk(0);
      setFraudFlags({});

      const txData = await getTransaction(txHash.trim());
      setTransaction(txData);

      const fraudResult = await checkFraudRisk(txData);
      setFraudRisk(fraudResult.risk);
      setFraudFlags(fraudResult.flags);
    } catch (err) {
      setError(err.message);
      setTransaction(null);
      setFraudRisk(0);
      setFraudFlags({});
    }
  };

  const RiskIndicator = ({ risk }) => {
    const color = risk < 30 ? "#4CAF50" : risk < 70 ? "#FF9800" : "#F44336";

    return (
      <div
        className="risk-card"
        style={{
          borderColor: color,
          backgroundColor: `${color}10`,
        }}
      >
        <h3 style={{ color }}>
          Fraud Risk: {risk}%
          {transaction?.ageHours && (
            <span className="tx-age">(Age: {transaction.ageHours} hours)</span>
          )}
        </h3>

        <div className="flags-container">
          {fraudFlags.zeroValue && <Flag color="#F44336">Zero Value Transfer</Flag>}
          {fraudFlags.unverifiedContract && <Flag color="#9C27B0">Unverified Contract</Flag>}
          {fraudFlags.highValue && <Flag color="#EF5350">High Value (&gt;0.3 ETH)</Flag>}
          {fraudFlags.highGas && <Flag color="#FFA726">High Gas (&gt;3 Gwei)</Flag>}
          {fraudFlags.newAccount && <Flag color="#AB47BC">New Account</Flag>}
          {fraudFlags.frequentTransactions && <Flag color="#42A5F5">Frequent TXs</Flag>}
          {fraudFlags.roundNumber && <Flag color="#FFEE58">Round Number</Flag>}
          {fraudFlags.oldTransaction && <Flag color="#BDBDBD">Old Transaction</Flag>}
        </div>
      </div>
    );
  };

  const Flag = ({ children, color }) => (
    <div
      className="risk-flag"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}`,
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain Fraud Detection System</h1>

        {/* SEARCH BAR */}
        <div className="search-box">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste Sepolia transaction hash (0x...)"
            className="hash-input"
          />
          <button onClick={handleSearch} className="analyze-btn">
            Analyze
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {transaction && (
          <div className="tx-details">
            <h2>Transaction Details</h2>
            <div className="tx-info">
              <div>
                <span>Hash:</span> {transaction.hash}
              </div>
              <div>
                <span>From:</span> {transaction.from}
              </div>
              <div>
                <span>To:</span> {transaction.to || "Contract Creation"}
              </div>
              <div>
                <span>Value:</span> {transaction.value} ETH
              </div>
              <div>
                <span>Gas Price:</span> {transaction.gasPrice} Gwei
              </div>
              <div>
                <span>Age:</span> {transaction.ageHours} hours
              </div>
            </div>
          </div>
        )}

        {fraudRisk > 0 && <RiskIndicator risk={fraudRisk} />}
      </header>
    </div>
  );
}

export default App;
