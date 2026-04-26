import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Dashboard.css';

export function Dashboard({ setToast }) {
  const navigate = useNavigate();
  const { devices, commands, auditEntries, activityFeed, globalTrustScore, networkStatus } = useContext(AppContext);

  const verifiedDevices = devices.filter(d => d.status === 'Verified').length;
  const threatsBlocked = commands.filter(c => c.status === 'Rejected').length +
    auditEntries.filter(e => e.isSuspicious).length;

  const getTrustColor = (score) => {
    if (score > 80) return 'green';
    if (score > 50) return 'amber';
    return 'red';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActivityBorderColor = (type) => {
    switch (type) {
      case 'registration': return '#3b82f6';
      case 'command_approved': return '#10b981';
      case 'command_rejected':
      case 'suspicious': return '#ef4444';
      case 'audit': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time network status and trust metrics</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-5 mb-3">
        <div className="card metric-card">
          <div className="metric-label">Network Trust Score</div>
          <div className={`metric-value trust-${getTrustColor(globalTrustScore)}`}>
            {globalTrustScore}%
          </div>
          <div className="metric-bar" style={{
            background: getTrustColor(globalTrustScore) === 'green' ? 'var(--accent-green)' :
              getTrustColor(globalTrustScore) === 'amber' ? 'var(--accent-amber)' : 'var(--accent-red)'
          }}></div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Active Devices</div>
          <div className="metric-value" style={{ color: 'var(--accent-blue)' }}>
            {verifiedDevices}
          </div>
          <div className="metric-subtitle">of {devices.length} registered</div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Commands Issued</div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            {commands.length}
          </div>
          <div className="metric-subtitle">total on-chain</div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Threats Blocked</div>
          <div className="metric-value" style={{ color: 'var(--accent-red)' }}>
            {threatsBlocked}
          </div>
          <div className="metric-subtitle">prevented</div>
        </div>

        <div className="card metric-card">
          <div className="metric-label">Blockchain Entries</div>
          <div className="metric-value" style={{ color: 'var(--accent-purple)' }}>
            {auditEntries.length}
          </div>
          <div className="metric-subtitle">audit events</div>
        </div>
      </div>

      {/* Activity Feed and Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Live Activity Feed</h2>
          </div>
          <div className="activity-feed">
            {activityFeed.length === 0 ? (
              <div className="empty-state">No activity yet</div>
            ) : (
              activityFeed.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div
                    className="activity-border"
                    style={{ borderLeftColor: getActivityBorderColor(activity.type) }}
                  ></div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Network Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Network Summary</h2>
          </div>
          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-label">Total Devices</span>
              <span className="summary-value">{devices.length}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Verified</span>
              <span className="summary-value" style={{ color: 'var(--accent-green)' }}>
                {verifiedDevices}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Revoked</span>
              <span className="summary-value">
                {devices.filter(d => d.status === 'Revoked').length}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Flagged</span>
              <span className="summary-value" style={{ color: 'var(--accent-red)' }}>
                {devices.filter(d => d.status === 'Flagged').length}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Approved Cmds</span>
              <span className="summary-value" style={{ color: 'var(--accent-green)' }}>
                {commands.filter(c => c.status === 'Approved').length}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Rejected Cmds</span>
              <span className="summary-value" style={{ color: 'var(--accent-red)' }}>
                {commands.filter(c => c.status === 'Rejected').length}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Suspicious Events</span>
              <span className="summary-value" style={{ color: 'var(--accent-red)' }}>
                {auditEntries.filter(e => e.isSuspicious).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-4">
        <button className="quick-action-card"
          onClick={() => navigate('/devices')}>
          <div className="qa-icon">📋</div>
          <div className="qa-title">Register New Device</div>
          <div className="qa-subtitle">Add to network</div>
          <div className="qa-arrow">→</div>
        </button>

        <button className="quick-action-card"
          onClick={() => navigate('/commands')}>
          <div className="qa-icon">⚡</div>
          <div className="qa-title">Submit Command</div>
          <div className="qa-subtitle">Execute via contract</div>
          <div className="qa-arrow">→</div>
        </button>

        <button className="quick-action-card"
          onClick={() => navigate('/audit')}>
          <div className="qa-icon">📊</div>
          <div className="qa-title">View Audit Log</div>
          <div className="qa-subtitle">Transaction history</div>
          <div className="qa-arrow">→</div>
        </button>

        <button className="quick-action-card"
          onClick={() => navigate('/anomaly')}>
          <div className="qa-icon">🔍</div>
          <div className="qa-title">Run Anomaly Check</div>
          <div className="qa-subtitle">AI behavior analysis</div>
          <div className="qa-arrow">→</div>
        </button>
      </div>
    </div>
  );
}
