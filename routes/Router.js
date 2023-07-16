
const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');

router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);

module.exports = router;
  