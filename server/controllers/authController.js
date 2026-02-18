const { db } = require('../services/firebase');

exports.verifyQR = async (req, res) => {
  const { studentId, token } = req.body;

  if (!studentId || !token) {
    return res.status(400).json({
      valid: false,
      message: "Missing studentId or token"
    });
  }

  try {
    const studentRef = db.collection("students").doc(studentId);
    const snap = await studentRef.get();

    if (!snap.exists) {
      return res.status(404).json({
        valid: false,
        message: "Student ID not found"
      });
    }

    const student = snap.data();

    if (student.token !== token) {
      return res.status(403).json({
        valid: false,
        message: "Invalid token"
      });
    }

    if (student.used) {
      return res.status(403).json({
        valid: false,
        message: "Token already used"
      });
    }

    res.json({
      valid: true,
      message: "Verified",
      student: {
        id: studentId,
        name: student.name,
        walletBound: !!student.walletAddress,
        walletAddress: student.walletAddress || null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};
exports.bindWallet = async (req, res) => {
  const { studentId, token, walletAddress, signature, message } = req.body;

  if (!studentId || !token || !walletAddress || !signature || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  try {
    const ethers = require("ethers");

    const recoveredAddress =
      ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Invalid wallet signature"
      });
    }

    const studentRef = db.collection("students").doc(studentId);
    const snap = await studentRef.get();

    if (!snap.exists) {
      return res.status(404).json({
        success: false,
        message: "Student ID not found"
      });
    }

    const student = snap.data();

    if (student.token !== token) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      });
    }

    if (student.walletAddress) {
      return res.status(403).json({
        success: false,
        message: "Wallet already bound"
      });
    }

    await studentRef.update({
      walletAddress: walletAddress
    });

    res.json({
      success: true,
      message: "Wallet bound successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.login = (req, res) => {
    res.status(501).json({ message: "Use QR Scan for this demo." });
};

exports.register = (req, res) => {
    res.status(501).json({ message: "Registration disabled for demo." });
};
