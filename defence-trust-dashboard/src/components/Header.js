import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useBlockchain, shortenAddress } from '../hooks/useBlockchain';
import './Header.css';

export function Header({ title }) {
  const { networkStatus, globalTrustScore } = useContext(AppContext);
  const { account, isConnected, connectWallet, disconnectWallet, isDemo } = useBlockchain();

  const isSecure = networkStatus === 'secure';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-center">
        <div className={`network-status ${isSecure ? 'status-secure' : 'status-threat'}`}>
          <div className="status-indicator pulse"></div>
          <span>
            {isSecure ? 'NETWORK SECURE' : 'THREAT DETECTED'}
          </span>
        </div>
      </div>

      <div className="header-right">
        {!isConnected ? (
          <button className="btn-primary" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <div className="flex gap-md">
            <div className="address-chip monospace">
              {shortenAddress(account)}
            </div>
            <button className="btn-secondary btn-small" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
