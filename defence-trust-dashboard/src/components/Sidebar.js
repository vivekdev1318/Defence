import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useBlockchain, shortenAddress } from '../hooks/useBlockchain';
import './Sidebar.css';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { devices } = useContext(AppContext);
  const { account, isConnected } = useBlockchain();

  const navItems = [
    { symbol: '⬡', label: 'Dashboard', path: '/' },
    { symbol: '⊞', label: 'Device Registry', path: '/devices' },
    { symbol: '>', label: 'Command Center', path: '/commands' },
    { symbol: '≡', label: 'Audit Log', path: '/audit' },
    { symbol: '⚡', label: 'Anomaly Detector', path: '/anomaly' },
    { symbol: '⚠', label: 'Attack Simulator', path: '/attack' },
    { symbol: '◎', label: 'Trust Analytics', path: '/analytics' }
  ];

  // Check if any device is flagged
  const hasFlaggedDevice = devices.some(d => d.status === 'Flagged');

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="shield-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 2L6 6V18C6 28 20 36 20 36C20 36 34 28 34 18V6L20 2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="logo-text">
          <div className="logo-title">BDTF</div>
          <div className="logo-subtitle">Defence Network</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const showBadge = hasFlaggedDevice && item.path === '/anomaly';

          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className="nav-symbol">{item.symbol}</span>
              <span className="nav-label">{item.label}</span>
              {showBadge && <div className="nav-badge"></div>}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer"></div>

      {/* Footer */}
      <div className="sidebar-footer">
        {isConnected ? (
          <>
            <div className="network-info">
              <div className="status-dot status-dot-connected"></div>
              <div className="network-text">
                <div className="network-label">Connected</div>
                <div className="network-address monospace">{shortenAddress(account)}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="network-info disconnected">
            <div className="status-dot status-dot-disconnected"></div>
            <div className="network-text">
              <div className="network-label">Disconnected</div>
              <div className="network-address">Demo Mode</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
