const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');

router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);
router.put('/users/:id', usersController.updateUser);
router.get('/users', usersController.getUsers);

module.exports = router;
  