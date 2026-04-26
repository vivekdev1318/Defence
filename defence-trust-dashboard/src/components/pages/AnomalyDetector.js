import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useBlockchain, shortenAddress } from '../../hooks/useBlockchain';
import { analyzeDevice } from '../../utils/anomalyEngine';
import './AnomalyDetector.css';


export function AnomalyDetector({ setToast }) {
  const [result, setResult] = useState("");
  const { devices, updateDeviceStatus, addAuditEntry, addActivity } = useContext(AppContext);
  const { contracts } = useBlockchain();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [observedData, setObservedData] = useState({
    sector: 'Sector A',
    speed: '',
    altitude: '',
    signal: 'Strong',
    lastCommand: '',
    responding: true,
    battery: '',
    headingDeviation: ''
  });
  

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [anomalyHistory, setAnomalyHistory] = useState([]);
  const [shutdownExecuted, setShutdownExecuted] = useState(false);

  const filterableDevices = devices.filter(d => d.status === 'Verified' || d.status === 'Flagged');

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedDevice) {
      setToast({ message: 'Please select a device', type: 'error' });
      return;
    }

    if (!observedData.battery || !observedData.speed || !observedData.altitude) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setIsAnalyzing(true);

    const result = analyzeDevice(
  {
    ...observedData,
    assignedSector: selectedDevice.sector,
    speed: parseFloat(observedData.speed) || 0,
    altitude: parseFloat(observedData.altitude) || 0,
    battery: parseFloat(observedData.battery) || 0,
    headingDeviation: parseFloat(observedData.headingDeviation) || 0
  },
  selectedDevice.type
);

// ==========================
// 🔷 ADD THIS AI CODE HERE
// ==========================

// Create 41-feature input for AI model
const aiSignal = [
  parseFloat(observedData.speed) || 0,
  parseFloat(observedData.altitude) || 0,
  parseFloat(observedData.battery) || 0,
  parseFloat(observedData.headingDeviation) || 0,
  observedData.responding ? 1 : 0,

  // Fill remaining with random (for now)
  ...Array(36).fill(0).map(() => Math.random() * 1000)
];

// Call AI backend
const aiPrediction = await sendToAI(aiSignal);

// If AI detects attack → add anomaly
if (aiPrediction === "ATTACK") {
  result.anomalies.push({
    type: "AI_ATTACK_DETECTED",
    severity: "Critical",
    confidence: 99,
    description: "AI detected malicious drone signal"
  });

  result.overallSeverity = "Critical";

  // 🔴 AUTO FLAG
  updateDeviceStatus(selectedDevice.address, 'Flagged');

  // 🔴 AUTO SHUTDOWN
  try {
    await contracts.deviceRegistry.revokeDevice(selectedDevice.address);
    setShutdownExecuted(true);
  } catch (err) {
    console.log("Blockchain error:", err);
  }

  setToast({
    message: "🚨 AI detected attack → Device auto flagged & shutdown",
    type: "error"
  });
}

// ==========================
// 🔷 END AI CODE
// ==========================

setAnalysis(result);
if (aiPrediction !== "ATTACK") {
  setShutdownExecuted(false);
}

// History update
setAnomalyHistory(prev => [
  {
    time: Date.now(),
    device: selectedDevice.id,
    anomalies: result.anomalies.length,
    severity: result.overallSeverity,
    actionTaken: aiPrediction === 1 ? 'Auto Shutdown' : 'None'
  },
  ...prev
]);

setIsAnalyzing(false);

if (aiPrediction === 0) {
  setToast({
    message: `Analysis complete: ${result.summary}`,
    type: result.anomalies.length > 0 ? 'warning' : 'success'
  });
}
  };

  const handleFlagDevice = async () => {
    try {
      updateDeviceStatus(selectedDevice.address, 'Flagged');

      addAuditEntry({
        device: selectedDevice.id,
        action: 'DEVICE_FLAGGED',
        details: `Device flagged due to anomaly detection: ${analysis.anomalies.map(a => a.type).join(', ')}`,
        timestamp: Date.now(),
        isSuspicious: true,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: '0x' + Math.random().toString(16).slice(2, 66)
      });

      setAnomalyHistory(prev =>
        prev.map((item, idx) =>
          idx === 0 ? { ...item, actionTaken: 'Flagged' } : item
        )
      );

      setToast({ message: `Device ${selectedDevice.id} flagged`, type: 'warning' });
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleEmergencyShutdown = async () => {
    try {
      const tx = await contracts.deviceRegistry.revokeDevice(selectedDevice.address);

      await contracts.auditLog.logAction(
        `EMERGENCY_SHUTDOWN on ${selectedDevice.id}`,
        true
      );

      updateDeviceStatus(selectedDevice.address, 'Revoked');

      addAuditEntry({
        device: selectedDevice.id,
        action: 'EMERGENCY_SHUTDOWN',
        details: `Emergency shutdown executed due to critical anomalies`,
        timestamp: Date.now(),
        isSuspicious: true,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: tx.hash || '0x' + Math.random().toString(16).slice(2, 66)
      });

      setAnomalyHistory(prev =>
        prev.map((item, idx) =>
          idx === 0 ? { ...item, actionTaken: 'Shutdown' } : item
        )
      );

      setShutdownExecuted(true);

      setToast({
        message: `Emergency shutdown executed! Tx: ${(tx.hash || '0x...').slice(0, 16)}...`,
        type: 'success'
      });
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const selectedDeviceData = selectedDevice ? devices.find(d => d.address === selectedDevice.address) : null;
  const missionProfile = analysis?.missionProfile;
async function sendToAI(signal) {
  try {
    const res = await fetch("http://192.168.0.109:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: signal })
    });

    if (!res.ok) {
      throw new Error("AI server not responding");
    }

    const data = await res.json();
    return data.prediction;

  } catch (err) {
    console.error("AI ERROR:", err);
    return "NORMAL"; // fallback so app doesn't crash
  }
}
  return (
    
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anomaly Detector</h1>
          <p className="page-subtitle">AI-powered behavior analysis with blockchain verification</p>
        </div>
      </div>

      <div className="anomaly-container">
        {/* Left Column: Input */}
        <div className="anomaly-input-panel">
          <h2 className="panel-title">Behavior Analysis Input</h2>

          <form onSubmit={handleAnalyze} className="behavior-form">
            {/* Step 1: Device Selection */}
            <div className="form-section">
              <h3 className="section-title">Step 1: Select Device</h3>
              <div className="form-group">
                <select
                  value={selectedDevice?.address || ''}
                  onChange={(e) => setSelectedDevice(
                    filterableDevices.find(d => d.address === e.target.value) || null
                  )}
                >
                  <option value="">-- Choose a device --</option>
                  {filterableDevices.map(d => (
                    <option key={d.address} value={d.address}>
                      {d.id} ({d.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Observed Behavior */}
            {selectedDevice && (
              <div className="form-section">
                <h3 className="section-title">Step 2: Observed Behavior</h3>

                <div className="form-group">
                  <label>Current Sector</label>
                  <select
                    value={observedData.sector}
                    onChange={(e) => setObservedData({ ...observedData, sector: e.target.value })}
                  >
                    {['Sector A', 'Sector B', 'Sector C', 'Sector D', 'Sector E'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Speed (km/h)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={observedData.speed}
                      onChange={(e) => setObservedData({ ...observedData, speed: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Altitude (m)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={observedData.altitude}
                      onChange={(e) => setObservedData({ ...observedData, altitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Signal Strength</label>
                  <select
                    value={observedData.signal}
                    onChange={(e) => setObservedData({ ...observedData, signal: e.target.value })}
                  >
                    <option>Strong</option>
                    <option>Moderate</option>
                    <option>Weak</option>
                    <option>Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Last Received Command</label>
                  <input
                    type="text"
                    placeholder="Command string"
                    value={observedData.lastCommand}
                    onChange={(e) => setObservedData({ ...observedData, lastCommand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Responding to Commands</label>
                  <select
                    value={observedData.responding ? 'Yes' : 'No'}
                    onChange={(e) => setObservedData({ ...observedData, responding: e.target.value === 'Yes' })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Battery (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={observedData.battery}
                      onChange={(e) => setObservedData({ ...observedData, battery: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Heading Deviation (°)</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      step="1"
                      value={observedData.headingDeviation}
                      onChange={(e) => setObservedData({ ...observedData, headingDeviation: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Analyze */}
            {selectedDevice && (
              <button
                type="submit"
                className="btn-primary"
                disabled={isAnalyzing}
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Behavior with AI Engine'
                )}
              </button>
            )}
          </form>

          {/* Results */}
          {analysis && (
            <div className="results-panel">
              {analysis.anomalies.length === 0 ? (
                <div className="result-card result-success">
                  <div className="result-title">✓ NO ANOMALIES DETECTED</div>
                  <div className="result-details">
                    {Object.entries(observedData).map(([key, value]) => (
                      <div key={key} className="result-check">
                        ✓ {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="result-card result-critical">
                  <div className="result-title">
                    ⚠ ANOMALIES DETECTED — {analysis.anomalies.length} violations
                  </div>

                  <div className="anomalies-list">
                    {analysis.anomalies.map((anomaly, idx) => (
                      <div key={idx} className="anomaly-item">
                        <div className="anomaly-header">
                          <span className={`badge badge-${anomaly.severity.toLowerCase()}`}>
                            {anomaly.severity}
                          </span>
                          <span className="anomaly-type">{anomaly.type}</span>
                        </div>
                        <div className="anomaly-description">{anomaly.description}</div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${anomaly.confidence}%` }}
                          ></div>
                        </div>
                        <div className="anomaly-confidence">
                          Confidence: {anomaly.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-warning"
                      onClick={handleFlagDevice}
                      style={{ width: '100%' }}
                    >
                      🚩 Flag Device
                    </button>
                    <button
                      className="btn-danger"
                      onClick={handleEmergencyShutdown}
                      style={{ width: '100%' }}
                      disabled={shutdownExecuted}
                    >
                      {shutdownExecuted
                        ? '🛑 Shutdown Executed — Device Revoked on Chain'
                        : '🛑 Emergency Shutdown'
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Profile & History */}
        <div className="anomaly-info-panel">
          {/* Mission Profile */}
          <div className="info-card">
            <h3 className="card-title">Mission Profile</h3>
            {!selectedDevice ? (
              <div className="empty-hint">Select a device to view its mission profile</div>
            ) : missionProfile ? (
              <table className="profile-table">
                <tbody>
                  <tr>
                    <td className="profile-param">Sector</td>
                    <td className="profile-value">{selectedDevice.sector}</td>
                  </tr>
                  <tr>
                    <td className="profile-param">Speed Range</td>
                    <td className="profile-value">
                      {missionProfile.speedRange.min}-{missionProfile.speedRange.max} km/h
                    </td>
                  </tr>
                  <tr>
                    <td className="profile-param">Altitude Range</td>
                    <td className="profile-value">
                      {missionProfile.altitudeRange.min}-{missionProfile.altitudeRange.max}m
                    </td>
                  </tr>
                  <tr>
                    <td className="profile-param">Min Battery</td>
                    <td className="profile-value">{missionProfile.minBattery}%</td>
                  </tr>
                  <tr>
                    <td className="profile-param">Max Heading Dev</td>
                    <td className="profile-value">{missionProfile.maxHeadingDeviation}°</td>
                  </tr>
                </tbody>
              </table>
            ) : null}
          </div>

          {/* Anomaly History */}
          <div className="info-card">
            <h3 className="card-title">Anomaly History</h3>
            {anomalyHistory.length === 0 ? (
              <div className="empty-hint">No analyses run yet</div>
            ) : (
              <>
                <div className="history-stats">
                  {anomalyHistory.length} analyses · {anomalyHistory.reduce((s, a) => s + a.anomalies, 0)} anomalies · {anomalyHistory.filter(a => a.actionTaken !== 'None').length} actioned
                </div>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Device</th>
                      <th>Anomalies</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalyHistory.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className={`history-row-${item.actionTaken.toLowerCase()}`}>
                        <td className="text-sm">
                          {new Date(item.time).toLocaleTimeString()}
                        </td>
                        <td className="text-sm">{item.device}</td>
                        <td className="text-center text-bold">{item.anomalies}</td>
                        <td>
                          <span className={`history-badge history-${item.actionTaken.toLowerCase()}`}>
                            {item.actionTaken}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
