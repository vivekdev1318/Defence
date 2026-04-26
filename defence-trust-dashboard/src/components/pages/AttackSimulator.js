import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './AttackSimulator.css';

export function AttackSimulator({ setToast }) {
  const { addAuditEntry } = useContext(AppContext);
  const [scenarios, setScenarios] = useState({
    spoofing: { running: false, result: null, executed: false },
    revoked: { running: false, result: null, executed: false },
    tamper: { running: false, result: null, executed: false },
    replay: { running: false, result: null, executed: false },
    demo: { running: false, result: null, executed: false }
  });

  const [stats, setStats] = useState({
    simulated: 0,
    blocked: 0,
    rate: 0,
    auditCreated: 0
  });

  const runScenario = (scenarioKey, result, isBlocked) => {
    setScenarios(prev => ({
      ...prev,
      [scenarioKey]: { ...prev[scenarioKey], running: true }
    }));

    setTimeout(() => {
      setScenarios(prev => ({
        ...prev,
        [scenarioKey]: {
          running: false,
          result,
          executed: true
        }
      }));

      addAuditEntry({
        device: 'ATTACK_SIMULATOR',
        action: `ATTACK_${scenarioKey.toUpperCase()}`,
        details: result,
        timestamp: Date.now(),
        isSuspicious: true,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: '0x' + Math.random().toString(16).slice(2, 66)
      });

      setStats(prev => ({
        simulated: prev.simulated + 1,
        blocked: isBlocked ? prev.blocked + 1 : prev.blocked,
        rate: Math.round(((isBlocked ? prev.blocked + 1 : prev.blocked) / (prev.simulated + 1)) * 100),
        auditCreated: prev.auditCreated + 1
      }));

      setToast({ message: 'Scenario executed and logged', type: 'success' });
    }, 1500);
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attack Simulator</h1>
          <p className="page-subtitle">Cybersecurity threat testing and response validation</p>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="scenarios-grid">
        {/* Card 1: Device Spoofing */}
        <div className="scenario-card card-red">
          <div className="scenario-icon">🔓</div>
          <div className="scenario-title">Device Spoofing Attack</div>
          <div className="scenario-description">
            Unregistered device attempts to issue authenticated command
          </div>
          <div className="scenario-expected">
            <strong>Expected:</strong> Smart contract rejects unregistered devices
          </div>
          <button
            className="btn-danger"
            onClick={() => runScenario('spoofing',
              'BLOCKED — Contract reverted: Device not registered.\nTx attempted by 0xSPOOF3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.\nNo command recorded on-chain.',
              true
            )}
            disabled={scenarios.spoofing.running || scenarios.spoofing.executed}
          >
            {scenarios.spoofing.running && <span className="spinner"></span>}
            Run Scenario
          </button>
          {scenarios.spoofing.result && (
            <div className="scenario-result result-blocked">
              {scenarios.spoofing.result}
            </div>
          )}
        </div>

        {/* Card 2: Revoked Device */}
        <div className="scenario-card card-red">
          <div className="scenario-icon">🚫</div>
          <div className="scenario-title">Revoked Device Command</div>
          <div className="scenario-description">
            Previously revoked device tries to regain control
          </div>
          <div className="scenario-expected">
            <strong>Expected:</strong> Smart contract checks registry status
          </div>
          <button
            className="btn-danger"
            onClick={() => runScenario('revoked',
              'BLOCKED — Device revoked at ' + new Date(Date.now() - 86400000).toLocaleTimeString() + '.\nCommandAuth contract verified revocation on-chain. Request denied.',
              true
            )}
            disabled={scenarios.revoked.running || scenarios.revoked.executed}
          >
            {scenarios.revoked.running && <span className="spinner"></span>}
            Run Scenario
          </button>
          {scenarios.revoked.result && (
            <div className="scenario-result result-blocked">
              {scenarios.revoked.result}
            </div>
          )}
        </div>

        {/* Card 3: Data Tamper */}
        <div className="scenario-card card-amber">
          <div className="scenario-icon">⚙️</div>
          <div className="scenario-title">Data Tamper Attempt</div>
          <div className="scenario-description">
            Attacker tries to modify existing audit log entry
          </div>
          <div className="scenario-expected">
            <strong>Expected:</strong> Blockchain immutability prevents modification
          </div>
          <button
            className="btn-warning"
            onClick={() => runScenario('tamper',
              'IMMUTABLE — Audit entry cannot be modified.\nAny change would invalidate entire chain from this block.\nAttack failed — data integrity preserved.',
              true
            )}
            disabled={scenarios.tamper.running || scenarios.tamper.executed}
          >
            {scenarios.tamper.running && <span className="spinner"></span>}
            Run Scenario
          </button>
          {scenarios.tamper.result && (
            <div className="scenario-result result-immutable">
              {scenarios.tamper.result}
            </div>
          )}
        </div>

        {/* Card 4: Replay Attack */}
        <div className="scenario-card card-amber">
          <div className="scenario-icon">🔄</div>
          <div className="scenario-title">Replay Attack</div>
          <div className="scenario-description">
            Attacker reuses captured command transaction
          </div>
          <div className="scenario-expected">
            <strong>Expected:</strong> Duplicate command ID rejected
          </div>
          <button
            className="btn-warning"
            onClick={() => runScenario('replay',
              'REJECTED — Command ID already exists on-chain.\nSmart contract mapping prevents duplicate execution.\nReplay attack neutralized.',
              true
            )}
            disabled={scenarios.replay.running || scenarios.replay.executed}
          >
            {scenarios.replay.running && <span className="spinner"></span>}
            Run Scenario
          </button>
          {scenarios.replay.result && (
            <div className="scenario-result result-immutable">
              {scenarios.replay.result}
            </div>
          )}
        </div>

        {/* Card 5: Full Demo */}
        <div className="scenario-card card-green full-width">
          <div className="scenario-icon">✓</div>
          <div className="scenario-title">Full Authorized Flow Demo</div>
          <div className="scenario-description">
            Complete trust chain validation with all components working together
          </div>
          <div className="scenario-expected">
            <strong>Expected:</strong> Successful end-to-end device operation
          </div>
          <button
            className="btn-success"
            onClick={() => {
              setScenarios(prev => ({
                ...prev,
                demo: { ...prev.demo, running: true, result: { steps: [] } }
              }));

              let currentStep = 0;
              const steps = [
                'Device Registration',
                'Identity Verification',
                'Command Authentication',
                'Audit Log Entry'
              ];

              const stepInterval = setInterval(() => {
                currentStep++;

                if (currentStep > 4) {
                  clearInterval(stepInterval);
                  setScenarios(prev => ({
                    ...prev,
                    demo: {
                      running: false,
                      result: 'SYSTEM WORKING — Complete trust chain verified.\nDevice identity cryptographically proven.\nCommand authorized by smart contract.\nImmutable audit trail created.',
                      executed: true
                    }
                  }));

                  setStats(prev => ({
                    simulated: prev.simulated + 1,
                    blocked: prev.blocked + 1,
                    rate: Math.round(((prev.blocked + 1) / (prev.simulated + 1)) * 100),
                    auditCreated: prev.auditCreated + 4
                  }));

                  setToast({ message: 'Full demo scenario completed successfully!', type: 'success' });
                } else {
                  setScenarios(prev => ({
                    ...prev,
                    demo: {
                      running: true,
                      result: {
                        steps: steps.map((s, i) => ({
                          name: s,
                          completed: i < currentStep
                        }))
                      },
                      executed: true
                    }
                  }));
                }
              }, 1000);
            }}
            disabled={scenarios.demo.running || scenarios.demo.executed}
          >
            {scenarios.demo.running && <span className="spinner"></span>}
            Run Full Demo
          </button>
          {scenarios.demo.result && (
            <div className="scenario-result result-success">
              {typeof scenarios.demo.result === 'string' ? (
                scenarios.demo.result
              ) : (
                <div className="demo-steps">
                  {scenarios.demo.result.steps?.map((step, idx) => (
                    <div key={idx} className={`demo-step ${step.completed ? 'completed' : ''}`}>
                      {step.completed ? '✓' : '○'} Step {idx + 1}: {step.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="attack-stats">
        <div className="stat-chip">
          <div className="stat-label">Attacks Simulated</div>
          <div className="stat-number">{stats.simulated}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Blocked</div>
          <div className="stat-number" style={{ color: 'var(--accent-green)' }}>
            {stats.blocked}
          </div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Success Rate</div>
          <div className="stat-number" style={{ color: 'var(--accent-blue)' }}>
            {stats.rate}%
          </div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Audit Entries Created</div>
          <div className="stat-number" style={{ color: 'var(--accent-amber)' }}>
            {stats.auditCreated}
          </div>
        </div>
      </div>
    </div>
  );
}
