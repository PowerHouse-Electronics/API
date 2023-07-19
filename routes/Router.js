const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');
const cellController = require('../controller/cellController');
const cpuController = require('../controller/cpuController');
const gconsoController = require('../controller/gconsController');


//Ruta usuiarios 
router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);
router.put('/users/:id', usersController.updateUser);
router.get('/users/:secret', usersController.getUsers);

//Rutas celulares 
router.get('/cellphones', cellController.getAllCellPhones);
router.post('/cellphones', cellController.addCellPhone);
router.put('/cellphones/:id', cellController.updateCellPhone);
router.delete('/cellphones/:id', cellController.deleteCellPhone);

//Rutas computadoras 
router.get('/cpus', cpuController.getAllCPUs);
router.post('/cpus', cpuController.addCPU);
router.put('/cpus/:id', cpuController.updateCPU);
router.delete('/cpus/:id', cpuController.deleteCPU);

//Rutas Consola de videojuegos
router.get('/gameconsoles', gconsoController.getAllGameConsoles);
router.post('/gameconsoles', gconsoController.addGameConsole);
router.put('/gameconsoles/:id', gconsoController.updateGameConsole); 
router.delete('/gameconsoles/:id', gconsoController.deleteGameConsole);


module.exports = router;
  