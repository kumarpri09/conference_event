

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

router.post('/create-intent', paymentController.createPaymentIntent);
router.put('/update-status', paymentController.updatePaymentStatus);
router.get('/user/:userId', paymentController.getUserPayments);

module.exports = router;
