import React, { useState, useContext, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AppContext } from '../../context/AppContext';
import { useBlockchain, shortenAddress } from '../../hooks/useBlockchain';
import './TrustAnalytics.css';

export function TrustAnalytics({ setToast }) {
  const { devices, commands, auditEntries, globalTrustScore } = useContext(AppContext);
  const { formatTs } = useBlockchain();

  const [trustScoreData, setTrustScoreData] = useState([]);
  const [commandData, setCommandData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [deviceStatusData, setDeviceStatusData] = useState([]);

  useEffect(() => {
    // Trust Score Timeline (last 20 points)
    const trust = [];
    for (let i = 19; i >= 0; i--) {
      const score = Math.max(50, globalTrustScore + (Math.random() - 0.5) * 20);
      trust.push({
        name: `T-${i}`,
        score: Math.round(score * 10) / 10
      });
    }
    setTrustScoreData(trust);

    // Commands per device
    const cmdData = devices.map(device => {
      const deviceCommands = commands.filter(c => c.device === device.id);
      return {
        device: shortenAddress(device.address),
        Approved: deviceCommands.filter(c => c.status === 'Approved').length,
        Rejected: deviceCommands.filter(c => c.status === 'Rejected').length
      };
    });
    setCommandData(cmdData);

    // Audit entries timeline
    const auditTimeline = [];
    for (let i = 19; i >= 0; i--) {
      const timestamp = Date.now() - (i * 5 * 60 * 1000); // 5 min intervals
      const entriesInWindow = auditEntries.filter(e =>
        e.timestamp > timestamp - 5 * 60 * 1000 && e.timestamp <= timestamp
      );
      auditTimeline.push({
        name: `T-${i}`,
        Total: entriesInWindow.length,
        Suspicious: entriesInWindow.filter(e => e.isSuspicious).length
      });
    }
    setAuditData(auditTimeline);

    // Device status distribution
    const statusDist = [
      {
        name: 'Verified',
        value: devices.filter(d => d.status === 'Verified').length,
        color: '#10b981'
      },
      {
        name: 'Revoked',
        value: devices.filter(d => d.status === 'Revoked').length,
        color: '#64748b'
      },
      {
        name: 'Flagged',
        value: devices.filter(d => d.status === 'Flagged').length,
        color: '#ef4444'
      },
      {
        name: 'Pending',
        value: devices.filter(d => d.status === 'Pending').length,
        color: '#f59e0b'
      }
    ];
    setDeviceStatusData(statusDist);
  }, [devices, commands, auditEntries, globalTrustScore, shortenAddress]);

  // Calculate metrics
  const approvedRate = commands.length > 0
    ? (commands.filter(c => c.status === 'Approved').length / commands.length) * 100
    : 0;

  const activeDevices = devices.filter(d => d.status === 'Verified').length;
  const deviceHealth = devices.length > 0 ? (activeDevices / devices.length) * 100 : 0;

  const getRateBadgeClass = (rate) => {
    if (rate > 90) return 'rate-great';
    if (rate > 70) return 'rate-good';
    return 'rate-warning';
  };

  const CustomPieLabel = (entry) => {
    const total = deviceStatusData.reduce((sum, s) => sum + s.value, 0);
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
    return `${entry.value} (${percent}%)`;
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trust Analytics</h1>
          <p className="page-subtitle">Real-time network metrics and performance insights</p>
        </div>
      </div>

      {/* Trust Score Formula */}
      <div className="trust-formula-card card">
        <h3 className="section-title">Trust Score Calculation</h3>
        <div className="formula-visualization">
          <div className="formula-block formula-auth">
            <div className="formula-label">Auth Rate</div>
            <div className="formula-value">{Math.round(approvedRate * 0.6 * 10) / 10}%</div>
            <div className="formula-factor">× 0.60</div>
          </div>
          <div className="formula-plus">+</div>
          <div className="formula-block formula-health">
            <div className="formula-label">Device Health</div>
            <div className="formula-value">{Math.round(deviceHealth * 0.4 * 10) / 10}%</div>
            <div className="formula-factor">× 0.40</div>
          </div>
          <div className="formula-equals">=</div>
          <div className="formula-block formula-result">
            <div className="formula-label">Trust Score</div>
            <div className="formula-value">{globalTrustScore}%</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Trust Score Timeline */}
        <div className="card">
          <h3 className="section-title">Trust Score Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trustScoreData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f' }} />
              <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commands per Device */}
        <div className="card">
          <h3 className="section-title">Commands per Device</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commandData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="device" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f' }} />
              <Legend />
              <Bar dataKey="Approved" fill="#10b981" />
              <Bar dataKey="Rejected" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Audit Entries Timeline */}
        <div className="card">
          <h3 className="section-title">Audit Entries Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={auditData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f' }} />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Suspicious" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Status Distribution */}
        <div className="card">
          <h3 className="section-title">Device Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomPieLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceStatusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Metrics Table */}
      <div className="card">
        <h3 className="section-title">Raw Metrics per Device</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Commands Sent</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Approval Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => {
                const deviceCmds = commands.filter(c => c.device === device.id);
                const approved = deviceCmds.filter(c => c.status === 'Approved').length;
                const total = deviceCmds.length;
                const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

                return (
                  <tr key={device.address}>
                    <td className="device-cell">{device.id}</td>
                    <td className="text-center">{total}</td>
                    <td className="text-center text-success">{approved}</td>
                    <td className="text-center text-danger">{total - approved}</td>
                    <td>
                      <span className={`rate-badge ${getRateBadgeClass(rate)}`}>
                        {rate}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${device.status.toLowerCase()}`}>
                        {device.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
