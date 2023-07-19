const express = require('express');
const router = express.Router();
const productControllers = require('../controller/productControllers');

router.get('/cellphones', cellPhoneController.getAllCellPhones);
router.post('/cellphones', cellPhoneController.createCellPhone);


module.exports = router;