/*const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');
const User = require('../models/usersModel');
const Order = require('../models/orderModel');

// Crear una nueva orden
exports.createOrder = async (req, res) => {
  try {
    const { user, products, total, shippingAddress } = req.body;

    // Validar campos vacíos
    if (!user || !products || !total || !shippingAddress) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar que el usuario exista en la base de datos
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    // Validar que los productos existan en la base de datos y sean válidos
    for (const item of products) {
      const { type, product } = item;
      let existingProduct;

      // Verificar el tipo de producto y validar según el modelo correspondiente
      if (type === 'CellPhone') {
        existingProduct = await CellPhone.findById(product);
      } else if (type === 'Computer') {
        existingProduct = await Computer.findById(product);
      } else if (type === 'GConsole') {
        existingProduct = await GConsole.findById(product);
      } else {
        return res.status(400).json({ error: 'Tipo de producto no válido' });
      }

      if (!existingProduct) {
        return res.status(404).json({ error: 'Uno o más productos no existen' });
      }
    }

    // Validar que las cantidades y precios sean números positivos
    for (const item of products) {
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'La cantidad de productos debe ser un número positivo' });
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        return res.status(400).json({ error: 'El precio de los productos debe ser un número positivo' });
      }
    }

    const newOrder = new Order({
      user,
      products,
      total,
      shippingAddress,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Orden creada correctamente', newOrder });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la orden' });
  }
};

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products.product', 'brand model price');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
};

// Actualizar el estado de una orden
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar campo vacío
    if (!status) {
      return res.status(400).json({ error: 'El campo de estado es obligatorio' });
    }

    // Validar que la orden exista en la base de datos
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'La orden no existe' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({ message: 'Estado de la orden actualizado correctamente', updatedOrder });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el estado de la orden' });
  }
};

// Eliminar una orden
exports.deleteOrder = async (req, res) => {
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
*/