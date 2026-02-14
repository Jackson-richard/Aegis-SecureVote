const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// Public route for casting vote (Security handled inside controller via Token check)
router.post('/cast', voteController.castVote);
router.get('/candidates', voteController.getResults);
router.get('/status', voteController.getElectionStatus);

// Security / Verification Routes
router.get('/verify/:proofId', voteController.verifyProof);
router.get('/audit-log', voteController.getAuditLog);

module.exports = router;
