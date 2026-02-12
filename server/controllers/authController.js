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

    // Return success and the student name for UI welcome message
    res.json({ valid: true, message: 'Verified', student: { id: student.id, name: student.name } });
};

// Keep existing methods as stubs or basic implementations if needed, 
// but for the demo we focus on QR.
exports.login = (req, res) => {
    res.status(501).json({ message: "Use QR Scan for this demo." });
};

exports.register = (req, res) => {
    res.status(501).json({ message: "Registration disabled for demo." });
};
