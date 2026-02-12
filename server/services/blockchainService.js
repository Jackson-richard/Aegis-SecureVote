const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// Hardhat default Account #0 private key (Admin)
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load ABI
const artifactPath = path.resolve(__dirname, '../../blockchain/artifacts/contracts/Voting.sol/Voting.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const abi = artifact.abi;

// Contract Address (Update this after deployment)
const CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

exports.getAllCandidates = async () => {
    try {
        const candidates = await contract.getAllCandidates();
        // Format the output
        return candidates.map(c => ({
            id: Number(c.id),
            name: c.name,
            voteCount: Number(c.voteCount)
        }));
    } catch (error) {
        console.error("Error fetching candidates:", error);
        throw error;
    }
};

exports.vote = async (candidateId, userId) => {
    try {
        const tx = await contract.vote(candidateId, userId);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        console.error("Error voting:", error);
        // Extract reason string if possible
        if (error.reason) throw new Error(error.reason);
        throw error;
    }
};
