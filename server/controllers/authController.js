const dataManager = require('../services/dataManager');

exports.verifyQR = (req, res) => {
    const { studentId, token } = req.body;

    if (!studentId || !token) {
        return res.status(400).json({ valid: false, message: 'Missing studentId or token' });
    }

    const db = dataManager.readDB();
    const student = db.students.find(s => s.id === studentId);

    if (!student) {
        return res.status(404).json({ valid: false, message: 'Student ID not found' });
    }

    if (student.token !== token) {
        return res.status(403).json({ valid: false, message: 'Invalid token' });
    }

    if (student.used) {
        return res.status(403).json({ valid: false, message: 'Token already used. You have already voted.' });
    }

    res.json({
        valid: true,
        message: 'Verified',
        student: {
            id: student.id,
            name: student.name,
            walletBound: !!student.walletAddress,
            walletAddress: student.walletAddress
        }
    });
};

exports.bindWallet = async (req, res) => {
    const { studentId, token, walletAddress, signature, message } = req.body;

    if (!studentId || !token || !walletAddress || !signature || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const ethers = require('ethers');
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, message: 'Invalid wallet signature' });
        }

        const db = dataManager.readDB();
        const studentIndex = db.students.findIndex(s => s.id === studentId);

        if (studentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = db.students[studentIndex];

        if (student.token !== token) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        if (student.walletAddress) {
            return res.status(403).json({ success: false, message: 'Wallet already bound to this student ID' });
        }

        db.students[studentIndex].walletAddress = walletAddress;

        if (dataManager.writeDB(db)) {
            res.json({ success: true, message: 'Wallet bound successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Database error' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.login = (req, res) => {
    res.status(501).json({ message: "Use QR Scan for this demo." });
};

exports.register = (req, res) => {
    res.status(501).json({ message: "Registration disabled for demo." });
};
