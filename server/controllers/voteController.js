const crypto = require('crypto');
const dataManager = require('../services/dataManager');

const DEMO_MODE = true;

const ELECTION_START_TIME = new Date('2026-02-13T10:00:00Z').getTime();
const ELECTION_END_TIME = new Date('2026-02-14T10:00:00Z').getTime();

exports.castVote = async (req, res) => {
    const { studentId, token, candidateId, message: voteMessage, signature, walletAddress } = req.body;

    const currentTime = Date.now();

    if (!DEMO_MODE) {
        if (currentTime < ELECTION_START_TIME) {
            return res.status(403).json({ success: false, message: "Election has not started yet." });
        }
        if (currentTime > ELECTION_END_TIME) {
            return res.status(403).json({ success: false, message: "Election is closed." });
        }
    }

    if (!studentId || !token || !candidateId) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (voteMessage && signature && walletAddress) {
        try {
            const ethers = require('ethers');
            const recoveredAddress = ethers.verifyMessage(voteMessage, signature);

            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(403).json({ success: false, message: "Invalid wallet signature" });
            }
        } catch (err) {
            return res.status(400).json({ success: false, message: "Signature verification failed" });
        }
    } else {
        return res.status(400).json({ success: false, message: "Wallet signature required" });
    }

    const db = dataManager.readDB();

    const studentIndex = db.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const student = db.students[studentIndex];

    if (student.token !== token) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }

    if (!student.walletAddress) {
        return res.status(403).json({ success: false, message: "Wallet not bound to student ID" });
    }

    if (student.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Wallet address does not match bound wallet" });
    }

    if (student.used) {
        return res.status(403).json({ success: false, message: "Double voting detected! Vote rejected." });
    }

    const targetCandidateId = parseInt(candidateId, 10);

    const candidateIndex = db.candidates.findIndex(c => c.id === targetCandidateId);
    if (candidateIndex === -1) {
        return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const actionId = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();

    let dataToHash = `${actionId}${timestamp}${nonce}`;
    if (walletAddress && signature) {
        dataToHash += `${walletAddress}${signature}`;
    }

    const proofId = crypto.createHash('sha256').update(dataToHash).digest('hex');

    db.students[studentIndex].used = true;
    db.candidates[candidateIndex].votes += 1;

    db.votes.push({
        candidateId: targetCandidateId,
        timestamp: timestamp,
        proofId: proofId
    });

    const auditRecord = {
        proofId: proofId,
        timestamp: timestamp,
        actionType: "VOTE_CAST",
        actionId: actionId,
        walletAddress: walletAddress || null
    };

    if (!db.auditLogs) {
        db.auditLogs = [];
    }
    db.auditLogs.push(auditRecord);

    if (dataManager.writeDB(db)) {
        res.json({
            success: true,
            message: "Vote cast successfully!",
            proofId: proofId
        });
    } else {
        res.status(500).json({ success: false, message: "Database write error" });
    }
};

exports.getResults = (req, res) => {
    const db = dataManager.readDB();
    res.json(db.candidates);
};

exports.verifyProof = (req, res) => {
    const { proofId } = req.params;
    const db = dataManager.readDB();

    const record = db.auditLogs ? db.auditLogs.find(log => log.proofId === proofId) : null;

    if (record) {
        res.json({
            valid: true,
            timestamp: record.timestamp,
            actionType: record.actionType,
            walletAddress: record.walletAddress,
            proofId: record.proofId
        });
    } else {
        res.json({
            valid: false,
            message: "Invalid or non-existent Proof ID."
        });
    }
};

exports.getAuditLog = (req, res) => {
    const db = dataManager.readDB();
    const logs = db.auditLogs || [];
    res.json(logs);
};

exports.getElectionStatus = (req, res) => {
    const currentTime = Date.now();
    let status = 'ONGOING';

    if (currentTime < ELECTION_START_TIME) {
        status = 'UPCOMING';
    } else if (currentTime > ELECTION_END_TIME) {
        status = 'CLOSED';
    }

    res.json({
        status: status,
        demoMode: DEMO_MODE,
        startTime: ELECTION_START_TIME,
        endTime: ELECTION_END_TIME
    });
};
