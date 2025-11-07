import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { StrengthProgressTracker, StrengthProgressTracker__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("StrengthProgressTracker")) as StrengthProgressTracker__factory;
  const strengthTrackerContract = (await factory.deploy()) as StrengthProgressTracker;
  const strengthTrackerContractAddress = await strengthTrackerContract.getAddress();

  return { strengthTrackerContract, strengthTrackerContractAddress };
}

describe("StrengthProgressTracker", function () {
  let signers: Signers;
  let strengthTrackerContract: StrengthProgressTracker;
  let strengthTrackerContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ strengthTrackerContract, strengthTrackerContractAddress } = await deployFixture());
  });

  it("should have zero records for new user", async function () {
    const recordCount = await strengthTrackerContract.getRecordCount(signers.alice.address);
    expect(recordCount).to.eq(0);
  });

  it("should record a training session", async function () {
    const weight = 100; // 100 kg
    const sets = 3;
    const reps = 10;

    // Encrypt the values
    const encryptedWeight = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(weight)
      .encrypt();

    const encryptedSets = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(sets)
      .encrypt();

    const encryptedReps = await fhevm
      .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
      .add32(reps)
      .encrypt();

    // Record the training session
    const tx = await strengthTrackerContract
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

    // Check record count
    const recordCount = await strengthTrackerContract.getRecordCount(signers.alice.address);
    expect(recordCount).to.eq(1);

    // Get the record and decrypt
    const [encryptedWeightHandle, encryptedSetsHandle, encryptedRepsHandle, timestamp] = 
      await strengthTrackerContract.getRecord(signers.alice.address, 0);

    const clearWeight = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedWeightHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );

    const clearSets = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedSetsHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );

    const clearReps = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedRepsHandle,
      strengthTrackerContractAddress,
      signers.alice,
    );

    expect(clearWeight).to.eq(weight);
    expect(clearSets).to.eq(sets);
    expect(clearReps).to.eq(reps);
    expect(timestamp).to.be.gt(0);
  });

  it("should record multiple training sessions", async function () {
    const sessions = [
      { weight: 100, sets: 3, reps: 10 },
      { weight: 105, sets: 3, reps: 12 },
      { weight: 110, sets: 4, reps: 8 },
    ];

    for (const session of sessions) {
      const encryptedWeight = await fhevm
        .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
        .add32(session.weight)
        .encrypt();

      const encryptedSets = await fhevm
        .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
        .add32(session.sets)
        .encrypt();

      const encryptedReps = await fhevm
        .createEncryptedInput(strengthTrackerContractAddress, signers.alice.address)
        .add32(session.reps)
        .encrypt();

      const tx = await strengthTrackerContract
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
    }

    const recordCount = await strengthTrackerContract.getRecordCount(signers.alice.address);
    expect(recordCount).to.eq(sessions.length);

    // Verify each record
    for (let i = 0; i < sessions.length; i++) {
      const [encryptedWeightHandle, encryptedSetsHandle, encryptedRepsHandle] = 
        await strengthTrackerContract.getRecord(signers.alice.address, i);

      const clearWeight = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedWeightHandle,
        strengthTrackerContractAddress,
        signers.alice,
      );

      const clearSets = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSetsHandle,
        strengthTrackerContractAddress,
        signers.alice,
      );

      const clearReps = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedRepsHandle,
        strengthTrackerContractAddress,
        signers.alice,
      );

      expect(clearWeight).to.eq(sessions[i].weight);
      expect(clearSets).to.eq(sessions[i].sets);
      expect(clearReps).to.eq(sessions[i].reps);
    }
  });

  it("should prevent accessing out of bounds record", async function () {
    await expect(
      strengthTrackerContract.getRecord(signers.alice.address, 0)
    ).to.be.revertedWith("Record index out of bounds");
  });
});


