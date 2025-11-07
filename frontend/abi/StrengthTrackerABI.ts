
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const StrengthTrackerABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getAllRecords",
      "outputs": [
        {
          "internalType": "euint32[]",
          "name": "weights",
          "type": "bytes32[]"
        },
        {
          "internalType": "euint32[]",
          "name": "setsArray",
          "type": "bytes32[]"
        },
        {
          "internalType": "euint32[]",
          "name": "repsArray",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256[]",
          "name": "timestamps",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getRecord",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "maxWeight",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sets",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "reps",
          "type": "bytes32"
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
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getRecordCount",
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
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "encryptedWeight",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedSets",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedReps",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "weightProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "setsProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "repsProof",
          "type": "bytes"
        }
      ],
      "name": "recordTraining",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

