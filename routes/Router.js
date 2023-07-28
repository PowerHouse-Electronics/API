const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');
const cellController = require('../controller/cellController');
const cpuController = require('../controller/cpuController');
const gconsoController = require('../controller/gconsController');
const orderController = require('../controller/orderController');
const productsController = require('../controller/productsController');



//Ruta usuiarios 
router.post('/users/register', usersController.registerUser);
router.post('/users/login', usersController.loginUser);
router.put('/users/:id', usersController.updateUser);
router.get('/users/:secret', usersController.getUsers);
router.delete('/users/:id', usersController.deleteUser);
router.post ('/users/:secret', usersController.searchUsers);
router.post('/users/image/:id', usersController.uploadImage);

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

//Rutas ordenes 
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id', orderController.updateOrderStatus);
router.delete('/orders/:id', orderController.deleteOrder); 

//Rutas productos
router.get('/products', productsController.getAllProducts);
router.get('/products/:category', productsController.getProductsByCategory);
router.post('/products', productsController.searchItems)


module.exports = router;  