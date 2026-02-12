const crypto = require('crypto');
const dataManager = require('../services/dataManager');

exports.castVote = (req, res) => {
    console.log("------------------------------------------------");
    console.log("VOTE REQUEST RECEIVED");
    console.log("Payload:", JSON.stringify(req.body, null, 2));

    const { studentId, token, candidateId } = req.body;

    if (!studentId || !token || !candidateId) {
        console.error("❌ Vote rejected: Missing required fields");
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const db = dataManager.readDB();

    // VERIFY AGAIN (Atomic-like check)
    const studentIndex = db.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
        console.error(`❌ Vote rejected: Student ID '${studentId}' not found in DB.`);
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const student = db.students[studentIndex];
    console.log(`Student Found: ${student.name} (${student.id})`);

    if (student.token !== token) {
        console.error(`❌ Vote rejected: Token mismatch for student ${studentId}.`);
        console.error(`  Expected: ${student.token}`);
        console.error(`  Received: ${token}`);
        return res.status(403).json({ success: false, message: "Invalid token" });
    }

    if (student.used) {
        console.warn(`⚠️ Vote rejected: Student ${studentId} has already voted.`);
        return res.status(403).json({ success: false, message: "Double voting detected! Vote rejected." });
    }

    // CAST VOTE
    // Ensure we handle both string and number inputs for candidateId
    const targetCandidateId = parseInt(candidateId, 10);
    console.log(`Targeting Candidate ID: ${targetCandidateId} (Raw: ${candidateId})`);

    const candidateIndex = db.candidates.findIndex(c => c.id === targetCandidateId);
    if (candidateIndex === -1) {
        console.error(`❌ Vote rejected: Candidate ID ${targetCandidateId} not found.`);
        return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    // --- SECURITY UPDATE: GENERATE PROOF ---
    const actionId = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();

    // Create SHA-256 hash (Proof ID)
    // Data included: actionId + timestamp + nonce (NO student ID, NO vote choice)
    const dataToHash = `${actionId}${timestamp}${nonce}`;
    const proofId = crypto.createHash('sha256').update(dataToHash).digest('hex');

    console.log(`🔐 Generated Proof ID: ${proofId}`);

    // Update State
    console.log(`✅ Recording vote for candidate ${targetCandidateId} by student ${studentId}`);
    db.students[studentIndex].used = true;
    db.candidates[candidateIndex].votes += 1;

    // Log vote (with Proof ID)
    db.votes.push({
        candidateId: targetCandidateId,
        timestamp: timestamp,
        proofId: proofId
    });

    // Immutable Audit Log
    // strictly append-only in practice by push()
    const auditRecord = {
        proofId: proofId,
        timestamp: timestamp,
        actionType: "VOTE_CAST",
        actionId: actionId, // Internal tracking
        nonce: nonce // Needed for re-verification if we ever wanted to implementation that
    };

    if (!db.auditLogs) {
        db.auditLogs = [];
    }
    db.auditLogs.push(auditRecord);

    if (dataManager.writeDB(db)) {
        console.log("✅ Database updated successfully with PROOF.");
        console.log("------------------------------------------------");
        res.json({
            success: true,
            message: "Vote cast successfully!",
            proofId: proofId
        });
    } else {
        console.error("❌ Critical: Database write failed.");
        res.status(500).json({ success: false, message: "Database write error" });
    }
};

exports.getResults = (req, res) => {
    const db = dataManager.readDB();
    res.json(db.candidates);
};

// --- NEW SECURITY ENDPOINTS ---

exports.verifyProof = (req, res) => {
    const { proofId } = req.params;
    const db = dataManager.readDB();

    const record = db.auditLogs ? db.auditLogs.find(log => log.proofId === proofId) : null;

    if (record) {
        res.json({
            valid: true,
            timestamp: record.timestamp,
            actionType: record.actionType
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
    // Return a sanitized version of the audit log (optional)
    // Here we return full proof IDs as they are public verification tokens
    // We do NOT return any user data (which isn't in auditLogs anyway)
    const logs = db.auditLogs || [];
    res.json(logs);
};
