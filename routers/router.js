const express = require('express');
const controller = require('../controllers/controller')
const router = express.Router();

router.post('/send-code', controller.sendVerificationCode);
router.post('/send-details', controller.sendConfirmationDetails);
router.post('/verify-code', controller.verifyOTP);
router.get('/google/Lorena', controller.manipulateDataLorena);
router.get('/google/redirect/Lorena',controller.googleRedirectLorena);
router.post('/schedule_event', controller.eventScheldule);
router.post('/showEvents', controller.showEvents);
router.post('/setIndex', controller.setKeyIndex);
router.post("/checkout-session",controller.checkoutStripe);
router.post("/create-customer",controller.createCustomer);
router.post("/create-payment-intent", controller.createPaymentIntent);
router.get("/config",controller.configTest);
router.post("/login", controller.login);
router.post("/saved-admin",controller.savedAdmin)
router.post("/register",controller.register);
module.exports = router;