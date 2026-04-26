// Smart contract addresses and ABIs for BDTF system
export const CONTRACT_ADDRESSES = {
  deviceRegistry: "0xEc29164D68c4992cEdd1D386118A47143fdcF142",
  commandAuth: "0x9396B453Fad71816cA9f152Ae785276a1D578492",
  auditLog: "0xB57ee0797C3fc0205714a577c02F7205bB89dF30"
};

// Device Registry ABI
// Functions: registerDevice(address, deviceId), revokeDevice(address), getDeviceStatus(address)
export const DEVICE_REGISTRY_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "deviceAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "deviceId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "DeviceRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "deviceAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "DeviceRevoked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "deviceList",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "devices",
		"outputs": [
			{
				"internalType": "string",
				"name": "deviceId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "registeredAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDeviceCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_deviceAddress",
				"type": "address"
			}
		],
		"name": "isDeviceRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_deviceAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_deviceId",
				"type": "string"
			}
		],
		"name": "registerDevice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_deviceAddress",
				"type": "address"
			}
		],
		"name": "revokeDevice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] [
  {
    "type": "function",
    "name": "registerDevice",
    "inputs": [
      { "name": "deviceAddress", "type": "address" },
      { "name": "deviceId", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeDevice",
    "inputs": [{ "name": "deviceAddress", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getDeviceStatus",
    "inputs": [{ "name": "deviceAddress", "type": "address" }],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  }
];

// Command Auth ABI
// Functions: submitCommand(string commandData), approveCommand(uint commandId), rejectCommand(uint commandId)
export const COMMAND_AUTH_ABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_registryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "commandId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "CommandApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "commandId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "CommandRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "commandId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "commandData",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "CommandSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_commandId",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "_reason",
				"type": "string"
			}
		],
		"name": "rejectCommand",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_commandData",
				"type": "string"
			}
		],
		"name": "submitCommand",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "commandIds",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "commands",
		"outputs": [
			{
				"internalType": "address",
				"name": "issuer",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "commandData",
				"type": "string"
			},
			{
				"internalType": "enum CommandAuth.CommandStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCommandCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registry",
		"outputs": [
			{
				"internalType": "contract IDeviceRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] [
  {
    "type": "function",
    "name": "submitCommand",
    "inputs": [{ "name": "commandData", "type": "string" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveCommand",
    "inputs": [{ "name": "commandId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rejectCommand",
    "inputs": [{ "name": "commandId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Audit Log ABI
// Functions: logAction(string action, bool isSuspicious), getEntryCount()
export const AUDIT_LOG_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "device",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "action",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "details",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isSuspicious",
				"type": "bool"
			}
		],
		"name": "ActionLogged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "getLog",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLogCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_action",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_details",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_isSuspicious",
				"type": "bool"
			}
		],
		"name": "logAction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "logs",
		"outputs": [
			{
				"internalType": "address",
				"name": "device",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "action",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "details",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isSuspicious",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
][
  {
    "type": "function",
    "name": "logAction",
    "inputs": [
      { "name": "action", "type": "string" },
      { "name": "isSuspicious", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getEntryCount",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
];
