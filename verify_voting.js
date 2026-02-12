const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';
const DB_PATH = path.join(__dirname, 'server/data/db.json');

async function runVerification() {
    console.log("🚀 Starting Verification Script...");

    // 1. Read DB to find a valid student and candidate
    try {
        const dbRaw = fs.readFileSync(DB_PATH, 'utf-8');
        const db = JSON.parse(dbRaw);

        const student = db.students.find(s => !s.used);
        if (!student) {
            console.error("❌ No unused students found for testing. Please reset db.json.");
            return;
        }

        const candidate = db.candidates[0];

        console.log(`👤 Testing with Student: ${student.name} (${student.id})`);
        console.log(`🗳️ Voting for Candidate: ${candidate.name} (${candidate.id})`);

        // 2. Cast Vote
        console.log("\n📡 Sending Vote Request...");
        const voteResponse = await fetch(`${API_URL}/api/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: student.id,
                token: student.token,
                candidateId: candidate.id
            })
        });

        const voteData = await voteResponse.json();

        if (voteData.success) {
            console.log("✅ Vote Cast Successfully!");
            const proofId = voteData.proofId;
            console.log(`🔐 Received Proof ID: ${proofId}`);

            if (!proofId) {
                console.error("❌ Error: No Proof ID returned!");
                return;
            }

            // 3. Verify Proof
            console.log("\n🔍 Verifying Proof...");
            const verifyResponse = await fetch(`${API_URL}/api/verify/${proofId}`);
            const verifyData = await verifyResponse.json();

            if (verifyData.valid) {
                console.log("✅ Proof Verified Successfully!");
                console.log(`   - Timestamp: ${verifyData.timestamp}`);
                console.log(`   - Action: ${verifyData.actionType}`);
            } else {
                console.error("❌ Proof Verification Failed:", verifyData.message);
            }

            // 4. Verify Audit Log
            console.log("\n📜 Checking Audit Log...");
            const auditResponse = await fetch(`${API_URL}/api/audit-log`);
            const auditLog = await auditResponse.json();
            const foundInLog = auditLog.find(l => l.proofId === proofId);

            if (foundInLog) {
                console.log("✅ Proof found in Audit Log!");
            } else {
                console.error("❌ Proof NOT found in Audit Log!");
            }

        } else {
            console.error("❌ Vote Failed:", voteData.message);
        }

    } catch (error) {
        console.error("❌ Error during verification:", error.message);
    }
}

runVerification();
