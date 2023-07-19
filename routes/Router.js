const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');
const cellController = require('../controller/cellController');

//Ruta usuiarios 
router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);
router.put('/users/:id', usersController.updateUser);
router.get('/users/:secret', usersController.getUsers);

//Rutas celulares 
router.get('/cellphones', cellController.getAllCellPhones);
router.post('/cellphones', cellController.addCellPhone);
router.put('/cellphones/:brand/:model', cellController.updateCellPhone);
router.delete('/cellphones/:brand/:model', cellController.deleteCellPhone);


module.exports = router;
  