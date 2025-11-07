#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const net = require('net');

const PORT = 8545;
const HOST = '127.0.0.1';

const client = net.createConnection({ port: PORT, host: HOST }, () => {
  console.log('Hardhat node is running on port 8545');
  process.exit(0);
});

client.on('error', () => {
  console.log('Hardhat node is not running on port 8545');
  process.exit(1);
});

setTimeout(() => {
  console.log('Connection timeout - Hardhat node might not be running');
  client.end();
  process.exit(1);
}, 2000);
