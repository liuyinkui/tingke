const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const checkinController = require('../controllers/checkinController');
const wordController = require('../controllers/wordController');
const milestoneController = require('../controllers/milestoneController');

// All routes require authentication
router.use(auth);

router.get('/profile', profileController.getProfile);
router.patch('/profile', profileController.updateProfile);
router.get('/daily-material', profileController.getDailyMaterial);
router.post('/checkin', checkinController.checkin);
router.get('/streak', checkinController.getStreak);
router.get('/stats/summary', checkinController.getSummary);
router.get('/stats/trend', checkinController.getAccuracyTrend);
router.get('/stats/comparison', checkinController.getComparison);
router.post('/milestone/check', milestoneController.checkMilestone);
router.get('/words', wordController.listWords);
router.get('/words/stats', wordController.wordStats);
router.delete('/words/:id', wordController.removeWord);

module.exports = router;
