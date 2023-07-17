
const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');

router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);
router.get('/users', usersController.hello);
router.put('/users/:id', usersController.updateUser);

module.exports = router;
  