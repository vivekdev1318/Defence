import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, DEVICE_REGISTRY_ABI, COMMAND_AUTH_ABI, AUDIT_LOG_ABI } from '../contracts/config';

export function shortenAddress(address) {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function formatTs(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleTimeString();
}

function generateFakeTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Mock implementation for when blockchain not available
const createMockContracts = () => ({
  deviceRegistry: {
    registerDevice: async (address, deviceId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    },
    revokeDevice: async (address) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    },
    getDeviceStatus: async (address) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Verified');
        }, 1000);
      });
    }
  },
  commandAuth: {
    submitCommand: async (commandData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    },
    approveCommand: async (commandId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    },
    rejectCommand: async (commandId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    }
  },
  auditLog: {
    logAction: async (action, isSuspicious) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: generateFakeTxHash() });
        }, 1500);
      });
    },
    getEntryCount: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(20);
        }, 1000);
      });
    }
  }
});

export function useBlockchain() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contracts, setContracts] = useState(createMockContracts());
  const [isDemo, setIsDemo] = useState(true);

  // Initialize on mount
  useEffect(() => {
    const initializeBlockchain = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });

          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            setAccount(address);
            setIsConnected(true);
            setChainId(network.chainId);
            setIsDemo(false);

            // Create contract instances
            const deviceRegistry = new ethers.Contract(
              CONTRACT_ADDRESSES.deviceRegistry,
              DEVICE_REGISTRY_ABI,
              signer
            );
            const commandAuth = new ethers.Contract(
              CONTRACT_ADDRESSES.commandAuth,
              COMMAND_AUTH_ABI,
              signer
            );
            const auditLog = new ethers.Contract(
              CONTRACT_ADDRESSES.auditLog,
              AUDIT_LOG_ABI,
              signer
            );

            setContracts({
              deviceRegistry,
              commandAuth,
              auditLog
            });
            setError(null);
          } else {
            setAccount(null);
            setIsConnected(false);
            setContracts(createMockContracts());
            setIsDemo(true);
          }
        } catch (err) {
          console.error('Blockchain initialization error:', err);
          setError(err.message);
          setContracts(createMockContracts());
          setIsDemo(true);
        }
      } else {
        // No MetaMask - demo mode
        setContracts(createMockContracts());
        setIsDemo(true);
      }
    };

    initializeBlockchain();

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
        setContracts(createMockContracts());
        setIsDemo(true);
      } else {
       // eslint-disable-next-line no-restricted-globals
       window.location.reload()
      }
    };

    const handleChainChanged = () => {
      // eslint-disable-next-line no-restricted-globals
      window.location.reload()
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found');
      return;
    }

    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setAccount(address);
      setIsConnected(true);
      setChainId(network.chainId);
      setIsDemo(false);
      setError(null);

      // Create contract instances
      const deviceRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.deviceRegistry,
        DEVICE_REGISTRY_ABI,
        signer
      );
      const commandAuth = new ethers.Contract(
        CONTRACT_ADDRESSES.commandAuth,
        COMMAND_AUTH_ABI,
        signer
      );
      const auditLog = new ethers.Contract(
        CONTRACT_ADDRESSES.auditLog,
        AUDIT_LOG_ABI,
        signer
      );

      setContracts({
        deviceRegistry,
        commandAuth,
        auditLog
      });
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setContracts(createMockContracts());
    setIsDemo(true);
    setError(null);
  }, []);

  return {
    account,
    isConnected,
    isLoading,
    error,
    chainId,
    contracts,
    connectWallet,
    disconnectWallet,
    shortenAddress,
    formatTs,
    isDemo
  };
}
