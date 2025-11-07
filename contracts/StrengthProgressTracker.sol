// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Strength Progress Tracker
/// @author Strength Tracker Team
/// @notice A contract for storing encrypted strength training data (max weight, sets, reps)
contract StrengthProgressTracker is SepoliaConfig {
    // Structure to store encrypted training data
    struct TrainingRecord {
        euint32 maxWeight;  // Maximum weight in encrypted form
        euint32 sets;       // Number of sets in encrypted form
        euint32 reps;       // Number of reps in encrypted form
        uint256 timestamp; // When the record was created
    }

    // Mapping from user address to their training records
    mapping(address => TrainingRecord[]) private userRecords;

    /// @notice Record a new strength training session
    /// @param encryptedWeight The encrypted maximum weight
    /// @param encryptedSets The encrypted number of sets
    /// @param encryptedReps The encrypted number of reps
    /// @param weightProof The proof for encrypted weight
    /// @param setsProof The proof for encrypted sets
    /// @param repsProof The proof for encrypted reps
    function recordTraining(
        externalEuint32 encryptedWeight,
        externalEuint32 encryptedSets,
        externalEuint32 encryptedReps,
        bytes calldata weightProof,
        bytes calldata setsProof,
        bytes calldata repsProof
    ) external {
        euint32 weight = FHE.fromExternal(encryptedWeight, weightProof);
        euint32 sets = FHE.fromExternal(encryptedSets, setsProof);
        euint32 reps = FHE.fromExternal(encryptedReps, repsProof);

        // Create new training record
        TrainingRecord memory newRecord = TrainingRecord({
            maxWeight: weight,
            sets: sets,
            reps: reps,
            timestamp: block.timestamp
        });

        userRecords[msg.sender].push(newRecord);

        // Allow contract and user to decrypt
        FHE.allowThis(weight);
        FHE.allow(weight, msg.sender);
        FHE.allowThis(sets);
        FHE.allow(sets, msg.sender);
        FHE.allowThis(reps);
        FHE.allow(reps, msg.sender);
    }

    /// @notice Get the number of training records for a user
    /// @param user The address of the user
    /// @return The number of records
    function getRecordCount(address user) external view returns (uint256) {
        return userRecords[user].length;
    }

    /// @notice Get a specific training record
    /// @param user The address of the user
    /// @param index The index of the record
    /// @return maxWeight The encrypted maximum weight
    /// @return sets The encrypted number of sets
    /// @return reps The encrypted number of reps
    /// @return timestamp When the record was created
    function getRecord(
        address user,
        uint256 index
    ) external view returns (euint32 maxWeight, euint32 sets, euint32 reps, uint256 timestamp) {
        require(index < userRecords[user].length, "Record index out of bounds");
        TrainingRecord memory record = userRecords[user][index];
        return (record.maxWeight, record.sets, record.reps, record.timestamp);
    }

    /// @notice Get all training records for a user (returns encrypted data)
    /// @param user The address of the user
    /// @return weights Array of encrypted weights
    /// @return setsArray Array of encrypted sets
    /// @return repsArray Array of encrypted reps
    /// @return timestamps Array of timestamps
    function getAllRecords(
        address user
    ) external view returns (
        euint32[] memory weights,
        euint32[] memory setsArray,
        euint32[] memory repsArray,
        uint256[] memory timestamps
    ) {
        uint256 count = userRecords[user].length;
        weights = new euint32[](count);
        setsArray = new euint32[](count);
        repsArray = new euint32[](count);
        timestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            TrainingRecord memory record = userRecords[user][i];
            weights[i] = record.maxWeight;
            setsArray[i] = record.sets;
            repsArray[i] = record.reps;
            timestamps[i] = record.timestamp;
        }
    }
}


// dev-6
// dev-10
// dev-14
// dev-18
// dev-22
