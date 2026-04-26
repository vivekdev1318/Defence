import React, { createContext, useState, useCallback } from 'react';

export const AppContext = createContext();

// Mock data generators
function generateMockDevices() {
  return [
    {
      id: "DRONE-ALPHA-01",
      type: "Drone",
      address: "0x4f3cA1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
      sector: "Sector A",
      status: "Verified",
      registeredAt: Date.now() - 3600000
    },
    {
      id: "NODE-SURVEILLANCE-02",
      type: "Surveillance Node",
      address: "0x7a2dC3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
      sector: "Sector B",
      status: "Verified",
      registeredAt: Date.now() - 7200000
    },
    {
      id: "DRONE-BETA-03",
      type: "Drone",
      address: "0x9b1aF5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
      sector: "Sector C",
      status: "Flagged",
      registeredAt: Date.now() - 1800000
    },
    {
      id: "CMD-NODE-04",
      type: "Command Node",
      address: "0x2c8eB7a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
      sector: "Sector D",
      status: "Revoked",
      registeredAt: Date.now() - 86400000
    },
    {
      id: "GROUND-VEH-05",
      type: "Ground Vehicle",
      address: "0x6d4fE2c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
      sector: "Sector E",
      status: "Verified",
      registeredAt: Date.now() - 43200000
    }
  ];
}

function generateMockCommands() {
  const devices = generateMockDevices();
  const commands = [
    { commandId: "CMD-0001", device: devices[0].id, commandData: "MOVE_TO_SECTOR_B --speed=30 --auth", priority: "High", status: "Approved", timestamp: Date.now() - 300000 },
    { commandId: "CMD-0002", device: devices[1].id, commandData: "SCAN_PERIMETER", priority: "Medium", status: "Approved", timestamp: Date.now() - 600000 },
    { commandId: "CMD-0003", device: devices[2].id, commandData: "REPORT_STATUS", priority: "Low", status: "Approved", timestamp: Date.now() - 900000 },
    { commandId: "CMD-0004", device: devices[0].id, commandData: "RETURN_TO_BASE", priority: "Critical", status: "Approved", timestamp: Date.now() - 1200000 },
    { commandId: "CMD-0005", device: devices[1].id, commandData: "PATROL_ROUTE_A", priority: "Medium", status: "Approved", timestamp: Date.now() - 1500000 },
    { commandId: "CMD-0006", device: devices[2].id, commandData: "OVERRIDE_SAFETY", priority: "High", status: "Rejected", timestamp: Date.now() - 1800000 },
    { commandId: "CMD-0007", device: devices[4].id, commandData: "TRANSMIT_DATA", priority: "Low", status: "Approved", timestamp: Date.now() - 2100000 },
    { commandId: "CMD-0008", device: devices[0].id, commandData: "HOLD_POSITION", priority: "Medium", status: "Approved", timestamp: Date.now() - 2400000 },
    { commandId: "CMD-0009", device: devices[1].id, commandData: "ENGAGE_STEALTH", priority: "High", status: "Approved", timestamp: Date.now() - 2700000 },
    { commandId: "CMD-0010", device: devices[4].id, commandData: "EMERGENCY_LAND", priority: "Critical", status: "Approved", timestamp: Date.now() - 3000000 },
    { commandId: "CMD-0011", device: devices[2].id, commandData: "OVERRIDE_AUTH", priority: "Critical", status: "Rejected", timestamp: Date.now() - 3300000 },
    { commandId: "CMD-0012", device: devices[0].id, commandData: "UPDATE_FIRMWARE", priority: "Medium", status: "Rejected", timestamp: Date.now() - 3600000 }
  ];
  return commands;
}

function generateMockAuditEntries() {
  const devices = generateMockDevices();
  const normalActions = [
    "DEVICE_REGISTERED",
    "COMMAND_APPROVED",
    "STATUS_CHECK",
    "PATROL_STARTED",
    "DATA_TRANSMITTED"
  ];
  const suspiciousActions = [
    "UNAUTHORIZED_ACCESS_ATTEMPT",
    "COMMAND_OVERRIDE_BLOCKED",
    "SUSPICIOUS_SIGNAL_DETECTED",
    "DEVICE_BEHAVIOR_ANOMALY"
  ];

  const entries = [];
  let isSuspicious = false;

  for (let i = 0; i < 20; i++) {
    if (i >= 16) isSuspicious = true;

    const actionList = isSuspicious ? suspiciousActions : normalActions;
    const action = actionList[Math.floor(Math.random() * actionList.length)];

    entries.push({
      device: devices[Math.floor(Math.random() * devices.length)].id,
      action,
      details: `Transaction details: ${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now() - (i * 600000),
      isSuspicious,
      blockNumber: 18000000 + i,
      txHash: "0x" + Math.random().toString(16).slice(2, 66)
    });
  }

  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

function generateActivityFeed(devices, commands, auditEntries) {
  const activities = [];

  // Add device registrations
  devices.forEach(device => {
    activities.push({
      type: "registration",
      message: `Device ${device.id} registered on blockchain`,
      timestamp: device.registeredAt
    });
  });

  // Add commands
  commands.forEach(cmd => {
    const type = cmd.status === "Approved" ? "command_approved" : "command_rejected";
    const msg = cmd.status === "Approved"
      ? `Command ${cmd.commandId} approved for ${cmd.device}`
      : `Command ${cmd.commandId} rejected for ${cmd.device}`;
    activities.push({
      type,
      message: msg,
      timestamp: cmd.timestamp
    });
  });

  // Add audit events
  auditEntries.slice(0, 5).forEach(entry => {
    const type = entry.isSuspicious ? "suspicious" : "audit";
    activities.push({
      type,
      message: `${entry.action} on ${entry.device}`,
      timestamp: entry.timestamp
    });
  });

  // Sort and take last 15
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
}

export function AppProvider({ children }) {
  const mockDevices = generateMockDevices();
  const mockCommands = generateMockCommands();
  const mockAuditEntries = generateMockAuditEntries();

  const [devices, setDevices] = useState(mockDevices);
  const [commands, setCommands] = useState(mockCommands);
  const [auditEntries, setAuditEntries] = useState(mockAuditEntries);
  const [activityFeed, setActivityFeed] = useState(
    generateActivityFeed(mockDevices, mockCommands, mockAuditEntries)
  );

  // Calculate global trust score
  const calculateGlobalTrustScore = useCallback((devs, cmds) => {
    if (cmds.length === 0 || devs.length === 0) return 100;

    const approvedCommands = cmds.filter(c => c.status === "Approved").length;
    const totalCommands = cmds.length;
    const activeDevices = devs.filter(d => d.status === "Verified").length;
    const totalDevices = devs.length;

    const authRate = totalCommands > 0 ? (approvedCommands / totalCommands) * 0.60 : 0;
    const deviceHealth = totalDevices > 0 ? (activeDevices / totalDevices) * 0.40 : 0;
    const score = (authRate + deviceHealth) * 100;

    return Math.round(score * 10) / 10;
  }, []);

  const globalTrustScore = calculateGlobalTrustScore(devices, commands);

  const networkStatus = auditEntries.slice(0, 10).some(e => e.isSuspicious)
    ? 'threat'
    : 'secure';

  const addActivity = useCallback((type, message) => {
    setActivityFeed(prev => {
      const newActivity = {
        type,
        message,
        timestamp: Date.now()
      };
      return [newActivity, ...prev].slice(0, 15);
    });
  }, []);

  const addDevice = useCallback((device) => {
    setDevices(prev => [device, ...prev]);
    addActivity('registration', `Device ${device.id} registered on blockchain`);
  }, [addActivity]);

  const addCommand = useCallback((command) => {
    setCommands(prev => [command, ...prev]);
    const actType = command.status === "Approved" ? "command_approved" : "command_rejected";
    addActivity(actType, `Command ${command.commandId} ${command.status.toLowerCase()}`);
  }, [addActivity]);

  const addAuditEntry = useCallback((entry) => {
    setAuditEntries(prev => [entry, ...prev]);
    const actType = entry.isSuspicious ? 'suspicious' : 'audit';
    addActivity(actType, `${entry.action} on ${entry.device}`);
  }, [addActivity]);

  const updateDeviceStatus = useCallback((address, newStatus) => {
    setDevices(prev =>
      prev.map(d =>
        d.address === address ? { ...d, status: newStatus } : d
      )
    );
  }, []);

  const contextValue = {
    devices,
    commands,
    auditEntries,
    activityFeed,
    globalTrustScore,
    networkStatus,
    addActivity,
    addDevice,
    addCommand,
    addAuditEntry,
    updateDeviceStatus
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
