import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useBlockchain } from '../../hooks/useBlockchain';
import './DeviceRegistry.css';

export function DeviceRegistry({ setToast }) {
  const { devices, addDevice, updateDeviceStatus, addAuditEntry } = useContext(AppContext);
  const { contracts, isDemo } = useBlockchain();

  const [formData, setFormData] = useState({
    address: '',
    deviceId: '',
    deviceType: 'Drone',
    sector: 'Sector A'
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateAddress = (addr) => {
    return addr.startsWith('0x') && addr.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(addr);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateAddress(formData.address)) {
      setToast({ message: 'Invalid Ethereum address (must be 0x + 40 hex chars)', type: 'error' });
      return;
    }

    if (!formData.deviceId.trim()) {
      setToast({ message: 'Device ID is required', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const tx = await contracts.deviceRegistry.registerDevice(
        formData.address,
        formData.deviceId
      );

      const newDevice = {
        id: formData.deviceId,
        type: formData.deviceType,
        address: formData.address,
        sector: formData.sector,
        status: 'Verified',
        registeredAt: Date.now()
      };

      addDevice(newDevice);

      addAuditEntry({
        device: formData.deviceId,
        action: 'DEVICE_REGISTERED',
        details: `Device registered on blockchain: ${formData.address}`,
        timestamp: Date.now(),
        isSuspicious: false,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: tx.hash || '0x' + Math.random().toString(16).slice(2, 66)
      });

      setToast({
        message: `Device registered! Tx: ${(tx.hash || '0x...').slice(0, 16)}...`,
        type: 'success'
      });

      setFormData({
        address: '',
        deviceId: '',
        deviceType: 'Drone',
        sector: 'Sector A'
      });
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (device) => {
    setIsLoading(true);

    try {
      const tx = await contracts.deviceRegistry.revokeDevice(device.address);

      updateDeviceStatus(device.address, 'Revoked');

      addAuditEntry({
        device: device.id,
        action: 'DEVICE_REVOKED',
        details: `Device revoked: ${device.address}`,
        timestamp: Date.now(),
        isSuspicious: false,
        blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
        txHash: tx.hash || '0x' + Math.random().toString(16).slice(2, 66)
      });

      setToast({ message: `Device revoked: ${device.id}`, type: 'success' });
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlag = (device) => {
    updateDeviceStatus(device.address, 'Flagged');

    addAuditEntry({
      device: device.id,
      action: 'DEVICE_FLAGGED',
      details: `Device flagged for suspicious behavior: ${device.address}`,
      timestamp: Date.now(),
      isSuspicious: true,
      blockNumber: Math.floor(Math.random() * 18000000) + 16000000,
      txHash: '0x' + Math.random().toString(16).slice(2, 66)
    });

    setToast({ message: `Device flagged: ${device.id}`, type: 'warning' });
  };

  const sortedDevices = [...devices].sort((a, b) => b.registeredAt - a.registeredAt);

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Registry</h1>
          <p className="page-subtitle">Register and manage autonomous devices</p>
        </div>
      </div>

      <div className="registry-container">
        {/* Registration Form */}
        <div className="registry-form-panel">
          <h2 className="panel-title">Register Device</h2>

          <form onSubmit={handleRegister} className="registration-form">
            <div className="form-group">
              <label>Device Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value.trim() })}
                disabled={isLoading}
              />
              <div className="form-hint">Ethereum address (42 chars)</div>
            </div>

            <div className="form-group">
              <label>Device ID / Name</label>
              <input
                type="text"
                placeholder="DRONE-ALPHA-01"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Device Type</label>
              <select
                value={formData.deviceType}
                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                disabled={isLoading}
              >
                <option>Drone</option>
                <option>Ground Vehicle</option>
                <option>Surveillance Node</option>
                <option>Command Node</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mission Sector</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                disabled={isLoading}
              >
                <option>Sector A</option>
                <option>Sector B</option>
                <option>Sector C</option>
                <option>Sector D</option>
                <option>Sector E</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                'Register on Blockchain'
              )}
            </button>
          </form>
        </div>

        {/* Devices Table */}
        <div className="registry-table-panel">
          <h2 className="panel-title">Registered Devices</h2>

          {sortedDevices.length === 0 ? (
            <div className="empty-state">No devices registered yet</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Sector</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDevices.map((device) => (
                    <tr key={device.address}>
                      <td className="text-bold">{device.id}</td>
                      <td>{device.type}</td>
                      <td className="monospace">{device.address.slice(0, 6)}...{device.address.slice(-4)}</td>
                      <td>{device.sector}</td>
                      <td>
                        <span className={`badge badge-${device.status.toLowerCase()}`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="text-dim text-sm">
                        {new Date(device.registeredAt).toLocaleTimeString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {device.status !== 'Revoked' && (
                            <>
                              <button
                                className="btn-secondary btn-small"
                                onClick={() => handleRevoke(device)}
                                disabled={isLoading}
                              >
                                Revoke
                              </button>
                              {device.status !== 'Flagged' && (
                                <button
                                  className="btn-warning btn-small"
                                  onClick={() => handleFlag(device)}
                                  disabled={isLoading}
                                >
                                  Flag
                                </button>
                              )}
                            </>
                          )}
                        </div>
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
