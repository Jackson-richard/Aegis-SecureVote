Aegis – Cryptographically Verifiable Digital Voting System

Aegis is a secure, transparent, and verifiable digital voting system designed for academic election demos.  
It combines traditional authentication (Student ID + Token) with modern cryptographic techniques and wallet-based authorization to ensure trust, integrity, and auditability.

This project is built as a **demo-ready system** for project expos, focusing on **security concepts**, not real political elections.

---

 🔍 Problem Statement

Traditional digital voting systems suffer from:
- Lack of transparency
- Possibility of vote tampering
- No way for voters to independently verify their vote
- Centralized trust in administrators

Aegis addresses these issues by introducing **cryptographic proof**, **wallet-based authorization**, and **verifiable audit logs**.

---

💡 Solution Overview
Aegis ensures that:
- Each student can vote **only once**
- Every vote generates a **tamper-proof Proof ID**
- Voters can independently verify that their vote exists
- No personal identity or vote choice is exposed during verification

---

🛠 Tech Stack Used

 Frontend
- React (Vite)
- JavaScript
- Tailwind / Custom CSS
- Axios

Backend
- Node.js
- Express.js
- Firebase

Cryptography & Web3
- SHA-256 hashing
- MetaMask wallet integration
- ethers.js (for wallet connection & message signing)

---

🔐 Core Security Features

 1. Student Authentication
- Login using **Student ID + Token** (simulated QR-based access)
- Prevents unauthorized access

 2. Wallet ↔ Student Binding
- Each Student ID is bound to **one wallet only**
- Wallet signs cryptographic messages
- Prevents impersonation and replay attacks

3. Cryptographic Proof ID
For every vote:
- A unique Proof ID is generated using **SHA-256**
- Hash input:
  - Action ID (UUID)
  - Timestamp
  - Random Nonce
- No personal data or vote choice is included 

4. Immutable Audit Log
- Proof IDs are stored in an **append-only audit log**
- No update or delete operations
- Ensures tamper resistance

 5. Public Verification
- Anyone can verify a Proof ID
- System checks:
  - Existence of Proof ID
  - Integrity (no alteration)
- Identity and vote choice remain private

---

⏱ Election Timing & Demo Mode

- Election window logic supported (Start / End time)
- **Demo Mode** enabled for expo usage
- Demo Mode allows voting regardless of time, while still showing election status

---
🧪 Tamper & Attack Resistance

- **Replay attacks prevented** using nonce + wallet signature
- **Double voting blocked** at backend
- **Tampered Proof IDs** clearly flagged during verification
- Rate-limiting and server-side validation applied

---

📊 Scalability (Conceptual)

- Proof generation is O(1)
- Verification uses indexed lookup
- Can scale to **10,000+ voters** with:
  - Database indexing
  - Distributed storage
  - Blockchain anchoring (future scope)

---
 🎯 Demo Flow (For Judges)

1. Login using Student ID + Token
2. Bind wallet (one-time)
3. Cast vote (wallet signs intent)
4. Proof ID generated and shown
5. Verify Proof ID on Verify page
6. Tampering attempt → verification fails

---
