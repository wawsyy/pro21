import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { StrengthProgressTracker } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("StrengthProgressTrackerSepolia", function () {
  let signers: Signers;
  let strengthTrackerContract: StrengthProgressTracker;
  let strengthTrackerContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const StrengthTrackerDeployment = await deployments.get("StrengthProgressTracker");
      strengthTrackerContractAddress = StrengthTrackerDeployment.address;
      strengthTrackerContract = await ethers.getContractAt("StrengthProgressTracker", StrengthTrackerDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should record and retrieve a training session on Sepolia", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    const weight = 100;
    const sets = 3;
    const reps = 10;

    progress("Encrypting weight...");
    const encryptedWeight = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(weight)
      .encrypt();

    progress("Encrypting sets...");
    const encryptedSets = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(sets)
      .encrypt();

    progress("Encrypting reps...");
    const encryptedReps = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(reps)
      .encrypt();

    progress(
      `Call recordTraining() StrengthTracker=${strengthTrackerContractAddress} signer=${signers.alice.address}...`,
    );
    let tx = await strengthTrackerContract
      .connect(signers.alice)
      .recordTraining(
        encryptedWeight.handles[0],
        encryptedSets.handles[0],
        encryptedReps.handles[0],
        encryptedWeight.inputProof,
        encryptedSets.inputProof,
        encryptedReps.inputProof
      );
    await tx.wait();

    progress(`Call getRecordCount()...`);
    const recordCount = await strengthTrackerContract.getRecordCount(signers.alice.address);
    expect(recordCount).to.eq(1);

    progress(`Call getRecord()...`);
    const [encryptedWeightHandle, encryptedSetsHandle, encryptedRepsHandle, timestamp] = 
      await strengthTrackerContract.getRecord(signers.alice.address, 0);
    expect(encryptedWeightHandle).to.not.eq(ethers.ZeroHash);
    expect(timestamp).to.be.gt(0);

    progress(`Decrypting weight...`);
    const clearWeight = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedWeightHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear weight=${clearWeight}`);

    progress(`Decrypting sets...`);
    const clearSets = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedSetsHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear sets=${clearSets}`);

    progress(`Decrypting reps...`);
    const clearReps = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedRepsHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear reps=${clearReps}`);

    expect(clearWeight).to.eq(weight);
    expect(clearSets).to.eq(sets);
    expect(clearReps).to.eq(reps);
  });
});


