const express = require('express');
const controller = require('../controllers/controller')
const router = express.Router();

router.post('/send-code', controller.sendVerificationCode);
router.post('/verify-code', controller.verifyOTP);
router.get('/google/Gabriela', controller.manipulateDataGabriela);
router.get('/google/Stefania', controller.manipulateDataStefania);
router.get('/google/Diana', controller.manipulateDataDiana);
router.get('/google/Catalina', controller.manipulateDataCatalina);
router.get('/google/redirect/Gabriela',controller.googleRedirectGabriela);
router.get('/google/redirect/Stefania',controller.googleRedirectStefania);
router.get('/google/redirect/Diana',controller.googleRedirectDiana);
router.get('/google/redirect/Catalina',controller.googleRedirectCatalina);
router.post('/schedule_event', controller.eventScheldule);
router.post('/showEvents', controller.showEvents);
router.post('/setIndex', controller.setKeyIndex);
router.post("/checkout-session",controller.checkoutStripe);
router.post("/create-payment-intent", controller.createPaymentIntent);
router.get("/config",controller.configTest)
module.exports = router;