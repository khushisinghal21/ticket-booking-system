const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { holdSeatController } = require('../controllers/seatHold.controller');

router.post('/seats/hold', verifyToken, holdSeatController);

module.exports = router;