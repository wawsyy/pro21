# Strength Progress Tracker

<!-- Development update: Enhanced documentation structure -->

An encrypted strength training progress tracker built with FHEVM (Fully Homomorphic Encryption Virtual Machine) by Zama. This application allows users to privately record and track their strength training data (max weight, sets, reps) with end-to-end encryption.

## Features

- **Privacy-Preserving**: All training data is encrypted using FHE (Fully Homomorphic Encryption)
- **User-Controlled**: Only you can decrypt and view your training data
- **Blockchain-Based**: Data stored on-chain in encrypted form
- **Rainbow Wallet Integration**: Easy wallet connection using RainbowKit
- **Secure Storage**: Encrypted data remains private even on public blockchain

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Run frontend**

   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure

```
strength-progress-tracker/
├── contracts/                    # Smart contract source files
│   └── StrengthProgressTracker.sol
├── deploy/                       # Deployment scripts
├── test/                         # Test files
│   ├── StrengthProgressTracker.ts
│   └── StrengthProgressTrackerSepolia.ts
├── frontend/                     # Next.js frontend application
│   ├── app/                      # Next.js app directory
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   └── fhevm/                    # FHEVM integration
├── hardhat.config.ts             # Hardhat configuration
└── package.json                  # Dependencies and scripts
```

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the top right corner
2. **Record Training**: Enter your max weight, sets, and reps, then click "Record Training Session"
3. **View History**: See all your encrypted training records in chronological order
4. **Decrypt Data**: Click "Decrypt" on any record to view the decrypted values using your private key

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27 with FHE support
- **FHE Encryption**: Zama FHEVM for homomorphic encryption
- **Frontend**: Next.js 15, React 19 with TypeScript
- **Wallet Integration**: RainbowKit, Wagmi v2
- **Blockchain**: Ethereum (Sepolia Testnet, Local Hardhat)
- **Development**: Hardhat, TypeChain, Ethers.js v6

## License

This project is licensed under the BSD-3-Clause-Clear License.

## Support

- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama FHEVM**


<!-- dev-4 -->
<!-- dev-8 -->
<!-- dev-12 -->
<!-- dev-16 -->
<!-- dev-20 -->
<!-- dev-24 -->
