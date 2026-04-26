import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useBlockchain } from '../../hooks/useBlockchain';
import './CommandCenter.css';

export function CommandCenter({ setToast }) {
  const { devices, commands, addCommand, addAuditEntry } = useContext(AppContext);
  const { contracts } = useBlockchain();

  const [formData, setFormData] = useState({
    deviceId: '',
    commandString: '',
    priority: 'Medium',
    targetSector: 'Sector A'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const verifiedDevices = devices.filter(d => d.status === 'Verified');

  const handleSubmitCommand = async (e) => {
    e.preventDefault();

    if (!formData.deviceId) {
      setToast({ message: 'Please select a device', type: 'error' });
      return;
    }

    if (!formData.commandString.trim()) {
      setToast({ message: 'Command string is required', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const tx = await contracts.commandAuth.submitCommand(
        JSON.stringify({
          deviceId: formData.deviceId,
          command: formData.commandString,
          priority: formData.priority,
          targetSector: formData.targetSector
        })
      );

      // Simulate approval (90% chance)
      const isApproved = Math.random() > 0.1;

      const commandId = `CMD-${String(commands.length + 1).padStart(4, '0')}`;
      const newCommand = {
        commandId,
        device: formData.deviceId,
        commandData: formData.commandString,
        priority: formData.priority,
        status: isApproved ? 'Approved' : 'Rejected',
        timestamp: Date.now()
      };

      addCommand(newCommand);

      addAuditEntry({
        device: formData.deviceId,
        action: isApproved ? 'COMMAND_APPROVED' : 'COMMAND_REJECTED',
        details: `Command: ${formData.commandString}`,
        timestamp: Date.now(),
        isSuspicious: !isApproved,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: tx.hash || '0x' + Math.random().toString(16).slice(2, 66)
      });

      setToast({
        message: `Command ${isApproved ? 'approved' : 'rejected'}! Tx: ${(tx.hash || '0x...').slice(0, 16)}...`,
        type: isApproved ? 'success' : 'warning'
      });

      setFormData({
        deviceId: '',
        commandString: '',
        priority: 'Medium',
        targetSector: 'Sector A'
      });
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommands = filterStatus === 'All'
    ? commands
    : commands.filter(c => c.status === filterStatus);

  const sortedCommands = [...filteredCommands].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Submit and track authenticated commands</p>
        </div>
      </div>

      <div className="command-container">
        {/* Submit Form */}
        <div className="command-form-panel">
          <h2 className="panel-title">Submit Command</h2>

          <form onSubmit={handleSubmitCommand} className="command-form">
            <div className="form-group">
              <label>Select Device</label>
              <select
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                disabled={isLoading}
              >
                <option value="">-- Choose a verified device --</option>
                {verifiedDevices.map(d => (
                  <option key={d.address} value={d.id}>
                    {d.id} ({d.type})
                  </option>
                ))}
              </select>
              {verifiedDevices.length === 0 && (
                <div className="form-hint text-accent">No verified devices available</div>
              )}
            </div>

            <div className="form-group">
              <label>Command String</label>
              <input
                type="text"
                placeholder="MOVE_TO_SECTOR_B --speed=30 --auth"
                value={formData.commandString}
                onChange={(e) => setFormData({ ...formData, commandString: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={isLoading}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Sector</label>
              <input
                type="text"
                placeholder="Sector B"
                value={formData.targetSector}
                onChange={(e) => setFormData({ ...formData, targetSector: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || verifiedDevices.length === 0}
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit via Smart Contract'
              )}
            </button>
          </form>
        </div>

        {/* Command History */}
        <div className="command-history-panel">
          <h2 className="panel-title">Command History</h2>

          <div className="filter-buttons">
            {['All', 'Approved', 'Rejected', 'Pending'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {sortedCommands.length === 0 ? (
            <div className="empty-state">No commands yet</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Command ID</th>
                    <th>Device</th>
                    <th>Command</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCommands.map((command) => (
                    <tr key={command.commandId} className={command.status === 'Rejected' ? 'rejected-row' : ''}>
                      <td className="monospace text-sm">{command.commandId}</td>
                      <td>{command.device}</td>
                      <td className="text-sm">{command.commandData}</td>
                      <td>
                        <span className="priority-badge">
                          {command.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${command.status.toLowerCase()}`}>
                          {command.status}
                        </span>
                      </td>
                      <td className="text-dim text-sm">
                        {new Date(command.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
