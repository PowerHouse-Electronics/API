const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');
const User = require('../models/usersModel');
const Order = require('../models/orderModel');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');


const validateFields = [
  check('user').not().isEmpty().withMessage('El usuario es obligatorio'),
  check('products').not().isEmpty().withMessage('Los productos son obligatorios'),
  check('total').not().isEmpty().withMessage('El total es obligatorio').isFloat().withMessage('El total debe ser un número'),
  check('shippingAddress').not().isEmpty().withMessage('La dirección de envío es obligatoria')
];

const createOrder = async (req, res) => {
  try {
    const { token, products, shippingAddress } = req.body;

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const decodedToken = jwt.verify(token, 'secretKey');
    const userId = decodedToken.userId;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    let total = 0;
    const orderProducts = [];
    for (const item of products) {
      const { product, quantity } = item;
      let existingProduct;

      existingProduct = await CellPhone.findById(product);
      if (!existingProduct) {
        existingProduct = await Computer.findById(product);
        if (!existingProduct) {
          existingProduct = await GConsole.findById(product);
          if (!existingProduct) {
            return res.status(404).json({ error: 'Uno o más productos no existen' });
          }
        }
      }

      const productTotal = existingProduct.price * quantity;
      total += productTotal;

      orderProducts.push({
        product: existingProduct._id,
        quantity,
        price: existingProduct.price,
        brand: existingProduct.brand,
        model: existingProduct.model
      });
    }

    for (const item of products) {
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'La cantidad de productos debe ser un número positivo' });
      }
    }

    const newOrder = new Order({
      user: userId,
      products: orderProducts,
      total,
      shippingAddress,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Orden creada correctamente', newOrder });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la orden' });
  }
};




const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()/*.populate('User').populate('products.product', 'brand model price')*/;

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let status


    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'La orden no existe' });
    }

    //obtener el estado de la orden y validar si es pendiente o enviado para poder actualizarlo
    if (existingOrder.status === 'pending') {
      status = 'sent';
    } else if (existingOrder.status === 'sent') {
      status = 'delivered';
    } else {
      return res.status(400).json({ error: 'La orden ya fue entregada' });
    }

    existingOrder.status = status;
    const updatedOrder = await existingOrder.save();

    res.json({ message: 'Estado de la orden actualizado correctamente', updatedOrder });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el estado de la orden' });
  }
};

// Eliminar una orden
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que la orden exista en la base de datos
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'La orden no existe' });
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la orden' });
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, deleteOrder };