import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "StrengthProgressTracker";

// <root>/packages/fhevm-hardhat-template
const rel = "..";

// <root>/packages/site/components
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/packages/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function deployOnHardhatNode() {
  // Skip deployment in CI/CD environments (Vercel, GitHub Actions, etc.)
  if (process.env.CI || process.env.VERCEL || process.env.VERCEL_ENV) {
    console.log("Skipping Hardhat node deployment in CI/CD environment");
    return;
  }
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    // Only try to auto-deploy in local development, not in CI/CD
    if (!process.env.CI && !process.env.VERCEL && !process.env.VERCEL_ENV) {
      // Try to auto-deploy the contract on hardhat node!
      deployOnHardhatNode();
    }
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Try hardhat network first, then localhost
let deployLocalhost = readDeployment("hardhat", 31337, CONTRACT_NAME, true /* optional */);
if (!deployLocalhost) {
  deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true /* optional */);
}
if (!deployLocalhost) {
  // In CI/CD environments, try to use existing ABI file if deployments are not available
  const existingABIPath = path.join(outdir, "StrengthTrackerABI.ts");
  if (fs.existsSync(existingABIPath)) {
    console.warn(`${line}No deployment found, but existing ABI file found. Using existing ABI.${line}`);
    // Try to read existing addresses file
    const existingAddressesPath = path.join(outdir, "StrengthTrackerAddresses.ts");
    if (fs.existsSync(existingAddressesPath)) {
      console.log("Using existing ABI and addresses files.");
      process.exit(0);
    }
  }
  // In CI/CD, try to use sepolia deployment as fallback
  if (process.env.CI || process.env.VERCEL || process.env.VERCEL_ENV) {
    const sepoliaDeployment = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);
    if (sepoliaDeployment) {
      console.log("Using Sepolia deployment as fallback in CI/CD environment");
      deployLocalhost = sepoliaDeployment;
    } else {
      console.error(`${line}No deployment found in CI/CD environment. Please ensure deployments are committed to the repository.${line}`);
      console.error(`Deployments directory: ${deploymentsDir}`);
      process.exit(1);
    }
  } else {
    console.error(`${line}No deployment found. Please deploy the contract first.${line}`);
    console.error(`Deployments directory: ${deploymentsDir}`);
    process.exit(1);
  }
}

// Sepolia is optional
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true /* optional */);
if (!deploySepolia) {
  deploySepolia= { abi: deployLocalhost.abi, address: "0x0000000000000000000000000000000000000000" };
}

if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}


const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const StrengthTrackerABI = ${JSON.stringify({ abi: deployLocalhost.abi }, null, 2)} as const;
\n`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const StrengthTrackerAddresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `StrengthTrackerABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `StrengthTrackerAddresses.ts`)}`);
console.log(tsAddresses);

fs.writeFileSync(path.join(outdir, `StrengthTrackerABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `StrengthTrackerAddresses.ts`),
  tsAddresses,
  "utf-8"
);


