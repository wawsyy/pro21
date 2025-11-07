"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useRainbowEthersSigner } from "../hooks/rainbow/useRainbowEthersSigner";
import { useStrengthTracker } from "@/hooks/useStrengthTracker";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState } from "react";

export const StrengthTrackerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useRainbowEthersSigner();

  const {
    instance: fhevmInstance,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const strengthTracker = useStrengthTracker({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [weight, setWeight] = useState<string>("");
  const [sets, setSets] = useState<string>("");
  const [reps, setReps] = useState<string>("");

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (!isConnected) {
    return (
      <div className="mx-auto mt-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-300 mb-6">
          Connect your Rainbow wallet to start tracking your encrypted strength training progress
        </p>
        <button className={buttonClass} onClick={connect}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (strengthTracker.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  const handleRecord = () => {
    const weightNum = parseInt(weight);
    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);

    if (isNaN(weightNum) || isNaN(setsNum) || isNaN(repsNum)) {
      alert("Please enter valid numbers");
      return;
    }

    if (weightNum <= 0 || setsNum <= 0 || repsNum <= 0) {
      alert("All values must be greater than 0");
      return;
    }

    strengthTracker.recordTraining(weightNum, setsNum, repsNum);
    setWeight("");
    setSets("");
    setReps("");
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="grid w-full gap-6 px-4">
      <div className="col-span-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Record Training Session
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Weight (kg)
            </label>
            <input
              type="number"
              className={inputClass}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="100"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sets
            </label>
            <input
              type="number"
              className={inputClass}
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="3"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reps
            </label>
            <input
              type="number"
              className={inputClass}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10"
              min="1"
            />
          </div>
        </div>
        <button
          className={buttonClass}
          disabled={!strengthTracker.canRecord}
          onClick={handleRecord}
          title={
            !strengthTracker.canRecord
              ? `Cannot record: ${
                  !strengthTracker.contractAddress
                    ? "Contract not deployed"
                    : !fhevmInstance
                    ? "FHEVM not initialized"
                    : !ethersSigner
                    ? "Wallet not connected"
                    : strengthTracker.isRecording
                    ? "Already recording"
                    : "Loading..."
                }`
              : "Record your training session"
          }
        >
          {strengthTracker.isRecording
            ? "Recording..."
            : "Record Training Session"}
        </button>
        {!strengthTracker.canRecord && (
          <p className="mt-2 text-sm text-gray-500">
            {!strengthTracker.contractAddress
              ? "⚠️ Contract not deployed on this network"
              : !fhevmInstance
              ? "⏳ Initializing FHEVM encryption..."
              : !ethersSigner
              ? "⚠️ Please connect your wallet"
              : strengthTracker.isRecording
              ? "⏳ Recording in progress..."
              : "⏳ Loading..."}
          </p>
        )}
      </div>

      <div className="col-span-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Training History
          </h2>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={strengthTracker.loadRecords}
            disabled={!strengthTracker.canLoadRecords}
          >
            {strengthTracker.isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {strengthTracker.records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No training records yet. Record your first session above!
          </p>
        ) : (
          <div className="space-y-4">
            {strengthTracker.records.map((record, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Record #{index + 1}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(record.timestamp)}
                    </p>
                  </div>
                  {!record.decrypted && (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => strengthTracker.decryptRecord(index)}
                      disabled={strengthTracker.isDecrypting}
                    >
                      {strengthTracker.isDecrypting ? "Decrypting..." : "Decrypt"}
                    </button>
                  )}
                </div>
                {record.decrypted ? (
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="text-lg font-bold text-blue-700">
                        {record.decrypted.weight.toString()} kg
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Sets</p>
                      <p className="text-lg font-bold text-green-700">
                        {record.decrypted.sets.toString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Reps</p>
                      <p className="text-lg font-bold text-purple-700">
                        {record.decrypted.reps.toString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 italic">
                      Data encrypted. Click "Decrypt" to view.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {strengthTracker.message && (
        <div className="col-span-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">{strengthTracker.message}</p>
        </div>
      )}
    </div>
  );
};


